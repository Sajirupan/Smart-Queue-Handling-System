const Queue = require('../models/Queue');

// @desc    Generate a new token
// @route   POST /api/queue/generate
// @access  Public
exports.generateToken = async (req, res) => {
    try {
        const { name, serviceType, priority, userId } = req.body;

        // Get count for today to generate token number
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const count = await Queue.countDocuments({ createdAt: { $gte: start } });
        
        const tokenNumber = `T-${(count + 1).toString().padStart(3, '0')}`;

        const queueItem = await Queue.create({
            tokenNumber,
            user: userId || '662f8b5f9e1b2c001f4e5d6c', // Placeholder if not logged in
            serviceType,
            priority,
            status: 'Waiting'
        });

        // Broadcast to all connected clients
        const io = req.app.get('io');
        io.emit('new_token', queueItem);

        res.status(201).json({
            success: true,
            data: queueItem
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all active queue items
// @route   GET /api/queue/active
// @access  Public
exports.getActiveQueue = async (req, res) => {
    try {
        const queue = await Queue.find({ status: { $in: ['Waiting', 'Serving'] } })
            .sort({ createdAt: 1 })
            .populate('user', 'name');
            
        res.status(200).json({ success: true, data: queue });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
