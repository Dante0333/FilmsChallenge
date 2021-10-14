import { set } from "mongoose";
import React, { Component } from "react";
import { render } from "react-dom";

class App extends Component {

    render() {
        return(
            <div id="map-container">
                <div id="locations-panel">
                        <div id="locations-panel-list">
                            <button id="backbtn" className="back-button-hide">
                                <img className="icon" src="https://fonts.gstatic.com/s/i/googlematerialicons/arrow_back/v11/24px.svg" alt=""/>
                                <b>Back</b> 
                            </button>
                            <header>
                                <h1 className="search-title">
                                    <img src="https://fonts.gstatic.com/s/i/googlematerialicons/place/v15/24px.svg"/>
                                    Find a movie with their locations
                                </h1>
                            <div className="search-input">
                            <input id="inputMoviLoc" type="text" name="film" />
                            <div id="search-overlay-search" className="search-input-overlay search">
                                <button id="location-search-button">
                                <img className="icon" src="https://fonts.gstatic.com/s/i/googlematerialicons/search/v11/24px.svg" alt="Search"/>
                                </button>
                            </div>
                            </div> 
                            </header>
                            <div className="section-name" id="location-results-section-name">
                            All films
                            </div>
                            <div className="results">
                                <ul id="location-results-list"></ul>
                            </div>
                        </div>
                    </div>
                <div id="map"></div>
            </div>
        )
    }
}

export default App;