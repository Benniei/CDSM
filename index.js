// Import modules
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const session = require('express-session');
const path = require("path");

// Load config
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 4000;

// Initialize Express
const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({ origin:true, credentials:true }));                       // Enable Cross Origin Resource Sharing
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,                                                        // Don't save session if unmodified
  saveUninitialized: false,                                             // Don't create session until something is stored
  store: MongoStore.create( { mongoUrl: process.env.MONGO_URI })
}));

// Initialize Passport
require('./services/passport');
app.use(passport.initialize());
app.use(passport.session());

// Initialize database
const connectDB = require('./db/mongoose');
connectDB();

// Routers
app.use('/', require('./routes/authRouter'));
app.use('/', require('./routes/driveRouter'));
app.use('/', require('./routes/googleDriveRouter'));

// Hosts Static Websites
app.use(express.static(path.resolve(__dirname, "./client/build")));
app.get("*", function (request, response) {
    response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
  });

// Set server to listening mode
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)});