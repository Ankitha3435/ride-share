const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: 10, // Maximum number of sockets to keep in the MongoDB connection pool
            minPoolSize: 2,  // Minimum number of sockets to keep in the MongoDB connection pool
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds when finding a server
            heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
            retryWrites: true,
            w: 'majority', // Write concern for better consistency
        };

        await mongoose.connect(process.env.MONGODB_URI, options);

        // Disable debug mode to suppress Mongoose query logs
        mongoose.set('debug', false);
        
        // Handle errors after initial connection
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            // MongoDB disconnected
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB; 