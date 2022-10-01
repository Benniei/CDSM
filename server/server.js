express = require('express')
cors = require('cors')
cookieParser = require('cookie-parser')
app = express()
PORT = 3000

// Middleware
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin:true, credentials:true }));
 
// Routers
const router = require('./routes/router')
app.get("/", (req, res) => {
    res.send("hello");
});

// Init our Database Object
// const db = require('./db')
// db.on('error', console.error.bind(console, 'MongoDB connection error: '))

// Listen
app.listen(PORT,"localhost", () => console.log("Server running on port " + PORT))