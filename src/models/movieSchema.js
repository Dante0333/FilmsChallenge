const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
    title: String,
    release_year: Number,
    locations: String,
    production_company: String,
    director: String,
    writer: String,
    actor_1: String,
    actor_2: String,
    actor_3: String
})

module.exports = mongoose.model("movie", movieSchema)