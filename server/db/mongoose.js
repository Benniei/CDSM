// Import modules
const mongoose = require('mongoose');

// Establish connection to MongoDB, listen for errors before and after connection is established
const connectDB = async function() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB connected to cluster: ${conn.connection.host}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
    mongoose.connection.on('error', function() { console.error('Mongoose connection error: ') });
}

module.exports = connectDB;