let express = require('express')
let cors = require('cors')
let cookieParser = require('cookie-parser')
let app = express()
let PORT = 3000

// Middleware
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin:true, credentials:true }));
 
// Routers
let router = require('./routes/router')
app.use("/", router)

// Test Case
app.get("/", (req, res) => {
    res.send("hello");
});

// Init our Database Object
// const db = require('./db')
// db.on('error', console.error.bind(console, 'MongoDB connection error: '))

// Listen
app.listen(PORT,"localhost", () => console.log("Server running on port " + PORT))