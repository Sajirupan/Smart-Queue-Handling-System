const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('bufferCommands', false); // Disable buffering to prevent hanging queries
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
            bufferCommands: false // Disable buffering for this connection
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Self-healing: Check and seed administrative credentials and default counters in real MongoDB
        const User = require('../models/User');
        const Counter = require('../models/Counter');

        // 1. Seed Admin
        const adminExists = await User.findOne({ email: 'admin@smartqueue.com' });
        if (!adminExists) {
            console.log('🌱 [Self-Healing] Seeding Admin User into Real MongoDB...');
            await User.create({
                name: 'Admin User',
                email: 'admin@smartqueue.com',
                password: 'password123',
                role: 'admin',
                phone: '123-456-7890',
                status: 'active'
            });
        }

        // 2. Seed Staff
        const staffExists = await User.findOne({ email: 'staff@smartqueue.com' });
        if (!staffExists) {
            console.log('🌱 [Self-Healing] Seeding Staff User into Real MongoDB...');
            await User.create({
                name: 'Staff Member',
                email: 'staff@smartqueue.com',
                password: 'password123',
                role: 'staff',
                phone: '987-654-3210',
                status: 'active'
            });
        }

        // 3. Seed Counters
        const hasCounter1 = await Counter.findOne({ counterName: 'Counter 1' });
        if (!hasCounter1) {
            console.log('🌱 [Self-Healing] Seeding Default Counter 1 into Real MongoDB...');
            await Counter.create({ counterName: 'Counter 1', status: 'Inactive', staff: null });
        }
        const hasCounter2 = await Counter.findOne({ counterName: 'Counter 2' });
        if (!hasCounter2) {
            console.log('🌱 [Self-Healing] Seeding Default Counter 2 into Real MongoDB...');
            await Counter.create({ counterName: 'Counter 2', status: 'Inactive', staff: null });
        }
        const hasCounter3 = await Counter.findOne({ counterName: 'Counter 3' });
        if (!hasCounter3) {
            console.log('🌱 [Self-Healing] Seeding Default Counter 3 into Real MongoDB...');
            await Counter.create({ counterName: 'Counter 3', status: 'Inactive', staff: null });
        }

        console.log('✅ [Self-Healing] Live database verification & seeding complete.');

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.log('Server will continue running, but database operations will fail.');
    }
};

module.exports = connectDB;
