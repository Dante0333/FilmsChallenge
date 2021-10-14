const express = require("express")
const path = require("path")
const mongoose = require("./src/db/database.js")
const morgan = require("morgan")
const app = express()
const port = process.env.port || 5500

app.use(morgan('dev'))
app.use(express.json({limit: "50mb"}))

app.use(express.static(path.join(__dirname, 'src/public')))
app.use("/api/movies", require("./src/routes/routes.js"))

app.listen(port, ()=> {
    console.log(`Server on port ${port}`)
})