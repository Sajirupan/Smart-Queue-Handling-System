const Queue = require('../models/Queue');
const Counter = require('../models/Counter');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const sendNotification = async (user, phone, tokenNumber, serviceType) => {
    // Email Notification
    if (user && user.email && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            });
            await transporter.sendMail({
                from: `"SmartQueue" <${process.env.SMTP_USER}>`,
                to: user.email,
                subject: `Your Queue Token: ${tokenNumber}`,
                html: `<h3>Hello ${user.name},</h3><p>You have successfully joined the queue for <strong>${serviceType}</strong>.</p><h1>Token: ${tokenNumber}</h1><p>Please wait for your token to be called.</p>`
            });
            console.log('Email sent to', user.email);
        } catch (err) { console.error('Email failed:', err.message); }
    }

    // SMS Notification
    const targetPhone = phone || (user ? user.phone : null);
    if (targetPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            await client.messages.create({
                body: `SmartQueue: You joined the queue for ${serviceType}. Your Token is ${tokenNumber}.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: targetPhone
            });
            console.log('SMS sent to', targetPhone);
        } catch (err) { console.error('SMS failed:', err.message); }
    }
};

// @desc    Get counter info by ID (Public)
// @route   GET /api/queue/counter/:id
// @access  Public
exports.getCounterInfo = async (req, res) => {
    try {
        const counter = await Counter.findById(req.params.id);
        if (!counter) {
            return res.status(404).json({ success: false, message: 'Counter not found' });
        }
        res.status(200).json({ success: true, data: counter });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Generate a new token
// @route   POST /api/queue/generate
// @access  Public
exports.generateToken = async (req, res) => {
    try {
        const { serviceType, priority, userId } = req.body;

        if (!serviceType) {
            return res.status(400).json({ success: false, message: 'Please provide a service type' });
        }

        // Get count for today to generate token number
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const count = await Queue.countDocuments({ createdAt: { $gte: start } });
        
        const tokenNumber = `T-${(count + 1).toString().padStart(3, '0')}`;

        const queueItem = await Queue.create({
            tokenNumber,
            user: userId || null,
            customerName: req.body.customerName || 'Guest',
            phoneNumber: req.body.phone || null,
            serviceType,
            priority: priority || 'Normal',
            priorityLevel: priority === 'VIP' ? 3 : priority === 'Emergency' ? 4 : (priority === 'Normal' || !priority) ? 2 : 1,
            status: 'Waiting'
        });

        // Broadcast to all connected clients
        const io = req.app.get('io');
        if (io) io.emit('new_token', queueItem);

        // Fetch user for notifications
        let user = null;
        if (userId) user = await User.findById(userId);

        // Send Email & SMS asynchronously (don't block the response)
        sendNotification(user, req.body.phone, tokenNumber, serviceType);

        res.status(201).json({
            success: true,
            data: queueItem
        });
    } catch (err) {
        console.error('Generate Token Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all active queue items
exports.getActiveQueue = async (req, res) => {
    try {
        // Try finding without populate first if it fails, or just handle it
        const queue = await Queue.find({ status: { $in: ['Waiting', 'Serving'] } })
            .sort({ createdAt: 1 })
            .populate({
                path: 'user',
                select: 'name',
                match: { _id: { $exists: true } } // Only populate if user exists
            });
            
        res.status(200).json({ success: true, data: queue });
    } catch (err) {
        console.error('Get Active Queue Error:', err);
        // Return 500 for server errors, and include the error message for debugging
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error while fetching queue',
            error: err.message 
        });
    }
};
