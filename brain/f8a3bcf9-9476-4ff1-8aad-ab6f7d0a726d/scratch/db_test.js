const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const testConnection = async () => {
    console.log('--- Database Connection Test ---');
    console.log('URI:', process.env.MONGO_URI ? 'Defined' : 'UNDEFINED');
    
    if (!process.env.MONGO_URI) {
        console.error('Error: MONGO_URI is missing from .env file.');
        process.exit(1);
    }

    try {
        console.log('Attempting to connect...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('SUCCESS: Connected to MongoDB!');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Connection failed.');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        
        if (err.message.includes('whitelist')) {
            console.log('\n>>> ACTION REQUIRED: Your IP is not whitelisted in MongoDB Atlas.');
        } else if (err.message.includes('Authentication failed')) {
            console.log('\n>>> ACTION REQUIRED: Check your database username and password in .env.');
        }
        
        process.exit(1);
    }
};

testConnection();
