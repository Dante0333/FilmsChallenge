const express = require("express")
const router = express.Router();

const movie = require('../models/movieSchema.js')

router.get("/", async (req,res)=> {
    const movies = await movie.find().sort( { "title": 1 } )
    res.json(movies)
})
  
router.get("/:title", async (req,res)=> {
    const movies = await movie.find({ "title": req.params.title })
    res.json(movies)
})
       
router.post("/", (req,res)=> {
    let moviesData = req.body
    let mongoRecords = []
    moviesData.forEach(movieRec => {
        mongoRecords.push({
            title: movieRec.title,
            release_year: movieRec.release_year,
            locations: movieRec.locations,
            production_company: movieRec.production_company,
            director: movieRec.director,
            writer: movieRec.writer,
            actor_1: movieRec.actor_1,
            actor_2: movieRec.actor_2,
            actor_3: movieRec.actor_3
        })
    })
   
    movie.create(
        mongoRecords, (err, records)=>{
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).send({ status: 'Movie saved'})
            }
        }
    )
})
 
router.delete("/", (req, res)=>{
    movie.deleteMany({},(err)=>{
        if (err) {
            res.status(500).send(err)
        }
    })
})

module.exports = router