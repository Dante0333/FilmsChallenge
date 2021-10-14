function LocatorPlus(configuration) {
    const locator = this;

    locator.locations = configuration.locations || [];
    locator.capabilities = configuration.capabilities || {};

    const mapEl = document.getElementById('map');
    const panelEl = document.getElementById('locations-panel');
    locator.panelListEl = document.getElementById('locations-panel-list');
    const sectionNameEl = document.getElementById('location-results-section-name');
    const resultsContainerEl = document.getElementById('location-results-list');

    const itemsTemplate = Handlebars.compile(document.getElementById('locator-result-items-tmpl').innerHTML);

    locator.searchLocation = null;
    locator.searchLocationMarker = null;
    locator.selectedLocationIdx = null;
    locator.userCountry = null;

    // Initialize the map -------------------------------------------------------
    locator.map = new google.maps.Map(mapEl, configuration.mapOptions);

    // Store selection.
    const selectResultItem = function(locationIdx, panToMarker, scrollToResult) {
      locator.selectedLocationIdx = locationIdx;
      for (let locationElem of resultsContainerEl.children) {
        locationElem.classList.remove('selected');
        if (getResultIndex(locationElem) === locator.selectedLocationIdx) {
          locationElem.classList.add('selected');
          if (scrollToResult) {
            panelEl.scrollTop = locationElem.offsetTop;
          }
        }
      }
      if (panToMarker && (locationIdx != null)) {
        locator.map.panTo(locator.locations[locationIdx].coords);
      }
    };

    var markers = []

    // Create a marker for each location.
    if (detalles) {
      markers = locator.locations.map(function(location, index) {
      const marker = new google.maps.Marker({
        position: location.coords,
        map: locator.map,
        title: location.title,
      });

      marker.addListener('click', function() {
        selectResultItem(index, false, true);
      });

      return marker;
      });

      locator.updateBounds = function() {
      const bounds = new google.maps.LatLngBounds();

      if (locator.searchLocationMarker) {
        bounds.extend(locator.searchLocationMarker.getPosition());
      }
      for (let i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
      }
      //console.log(bounds)
      locator.map.fitBounds(bounds);
      };
      if (locator.locations.length) {
        locator.updateBounds();
      }

    } else {
      markers = []

      var boundDefault = {
        "south": 37.735903, 
        "west": -122.522861,
        "north": 37.789618, 
        "east": -122.376896
      }

      locator.map.fitBounds(boundDefault);
    }

    const getLocationDistance = function(location) {
      if (!locator.searchLocation) return null;

      // Fall back to straight-line distance.
      return google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(location.coords),
        locator.searchLocation.location);
    };

      // Render the results list --------------------------------------------------
    const getResultIndex = function(elem) {
      return parseInt(elem.getAttribute('data-location-index'));
    };

    locator.renderResultsList = function() {
      let locations = locator.locations.slice();
      for (let i = 0; i < locations.length; i++) {
        locations[i].index = i;
      }
      if (locator.searchLocation) {
        sectionNameEl.textContent =
            'Nearest locations (' + locations.length + ')';
        locations.sort(function(a, b) {
          return getLocationDistance(a) - getLocationDistance(b);
        });
      } else {
        if (detalles) {
          sectionNameEl.textContent = `All locations (${locations.length})`; 
        }
        else{
          sectionNameEl.textContent = `All films (${locations.length})`;
        }
      }
      const resultItemContext = { locations: locations };
      resultsContainerEl.innerHTML = itemsTemplate(resultItemContext);
      for (let item of resultsContainerEl.children) {
        const resultIndex = getResultIndex(item);
        if (resultIndex === locator.selectedLocationIdx) {
          item.classList.add('selected');
        }

        const resultSelectionHandler = function() {
          selectResultItem(resultIndex, true, false);
        };

        // Clicking anywhere on the item selects this location.
        // Additionally, create a button element to make this behavior
        // accessible under tab navigation.
        item.addEventListener('click', resultSelectionHandler);
        item.querySelector('.select-location')
            .addEventListener('click', function(e) {
              resultSelectionHandler();
              e.stopPropagation();
            });
      }
    };
  //initializeSearchInput(locator);

      // Initial render of results -----------------------------------------------
  locator.renderResultsList();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendMarkers(locationsRecs) {
  //console.table(locationsRecs)
  const CONFIGURATION = {
    "locations": locationsRecs,
    "mapOptions": {"center":{"lat":38.0,"lng":-100.0},"fullscreenControl":true,"mapTypeControl":false,"streetViewControl":false,"zoom":2,"zoomControl":true,"maxZoom":17},
    "mapsApiKey": "AIzaSyD6-zk3KeEccDPE-XPW7GPY51auR6KlfUM"
  }
  
  new LocatorPlus(CONFIGURATION);
}

async function fetchMovies(url) {
  let res = await fetch(url)
  return await res.json();
}

async function getData(location) {
  var latit = 0
  var long = 0  
  var plcId = ""  

  await axios.get("https://maps.googleapis.com/maps/api/geocode/json",{
    params:{
        address: location+", San Francisco, CA 94105, EE. UU.",
        key: "AIzaSyD6-zk3KeEccDPE-XPW7GPY51auR6KlfUM"
    }
  })
  .then(function (response) {
    latit = response.data.results[0].geometry.location.lat
    long = response.data.results[0].geometry.location.lng
    plcId = response.data.results[0].place_id
  })
  .catch(function (error) {
      console.log(error);
  })

  return await [latit, long, plcId];
}

var detalles = false;
    
async function initMap(title) {
  var movies = [];
  var latit = 0;
  var long = 0;
  var plcId = "";  
  const locationRecords = [];
  var moviesTitles = [];
  var moviesLocations = [];

  var a = document.getElementById('backbtn');  

  if (title) {
    if (detalles) {
      return;
    } else {
      movies = await fetchMovies(`/api/movies/${title}`);
      detalles = true;

      movies.forEach(movieRec => {

        getData(movieRec.locations)
        .then(res => {
        
          latit = res[0];
          long = res[1]; 
          plcId = res[2]; 

          locationRecords.push({
            title: movieRec.locations,
            address2: "San Francisco, CA 94105, EE. UU.",
            coords: {
                lat: latit,
                lng: long
            },
            placeId: plcId
          })

          moviesLocations[moviesLocations.length] = movieRec.locations;
        })
      })

    
    }
  } else {
    movies = await fetchMovies("/api/movies");

    var Numb_title = "";

    movies.forEach(movieRec => {

      if (Numb_title != movieRec.title) {

        Numb_title = movieRec.title;
      
        getData(movieRec.locations)
        .then(res => {
        
          latit = res[0];
          long = res[1];
          plcId = res[2];

              locationRecords.push({
                title: movieRec.title,
                info1: '(' + movieRec.release_year + ')',
                info2: 'Production: ' + movieRec.production_company ,
                info3: 'Director: ' + movieRec.director , 
                info4: 'Writer: ' +  movieRec.writer,
                coords: {
                    lat: latit,
                    lng: long
                },
                placeId: plcId
            })
            
            moviesTitles[moviesTitles.length] = movieRec.title;
        })
      }
    })

    
  }

  await sleep(2000);
  var autoCompl = document.getElementById('inputMoviLoc');  

  if (title) {
    autocomplete(autoCompl, moviesLocations);
    searchMovLoc(false);
    
    a.setAttribute('class', 'back-button');
  }else{
    autocomplete(autoCompl, moviesTitles);
    searchMovLoc(true);
    a.setAttribute('class', 'back-button-hide');
  }
  
  sendMarkers(locationRecords);
}

var backBtn = document.getElementById('backbtn');

backBtn.addEventListener('click', function() {
  locationRecords = [];
  detalles = false;
  initMap();
  infoMoviLoc.value = '';
});

var searchButt = document.getElementById('location-search-button');
var infoMoviLoc = document.getElementById('inputMoviLoc');

function searchMovLoc (val){
  if (val) {
    
    searchButt.addEventListener('click', function() {
      initMap(infoMoviLoc.value.trim());
    });
    searchButt.addEventListener('keypress', function(evt) {
      if (evt.key === 'Enter') {
        initMap(infoMoviLoc.value.trim());
      }
    });

  } else {
    searchButt.addEventListener('click', function() {
    var element = document.getElementById(infoMoviLoc.value.trim());
    element.click();
    });
  }
}
  
function autocomplete(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("DIV");
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                b.addEventListener("click", function(e) {
                inp.value = this.getElementsByTagName("input")[0].value;
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) { 
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}