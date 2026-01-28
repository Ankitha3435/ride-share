const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { initReliability } = require('./reliabilityHelper');

// Load .env from the backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
}

(async () => {
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');

        await initReliability();

    } catch (err) {
        console.error('Error during DB operations:', err);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
})(); 