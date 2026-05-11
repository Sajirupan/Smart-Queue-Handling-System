const Queue = require('../models/Queue');

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
            serviceType,
            priority: priority || 'Normal',
            status: 'Waiting'
        });

        // Broadcast to all connected clients
        const io = req.app.get('io');
        if (io) io.emit('new_token', queueItem);

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
