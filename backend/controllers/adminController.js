const User = require('../models/User');
const Queue = require('../models/Queue');
const Counter = require('../models/Counter');
const Feedback = require('../models/Feedback');
const QRCode = require('qrcode');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const [totalUsers, totalTokens, activeQueues, completedQueues, feedbackData] = await Promise.all([
            User.countDocuments({ role: 'customer' }),
            Queue.countDocuments({ createdAt: { $gte: start } }),
            Queue.countDocuments({ status: { $in: ['Waiting', 'Serving'] } }),
            Queue.countDocuments({ status: 'Completed', createdAt: { $gte: start } }),
            Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } }])
        ]);

        // Real hourly traffic for today
        const hourlyRaw = await Queue.aggregate([
            { $match: { createdAt: { $gte: start } } },
            { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        const hourlyData = hourlyRaw.map(h => ({
            hour: `${h._id % 12 || 12}${h._id < 12 ? 'am' : 'pm'}`,
            count: h.count
        }));

        // Real service type distribution
        const serviceRaw = await Queue.aggregate([
            { $match: { createdAt: { $gte: start } } },
            { $group: { _id: '$serviceType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const serviceData = serviceRaw.map(s => ({ serviceType: s._id, count: s.count }));

        const avgWait = feedbackData.length > 0 ? feedbackData[0].avg.toFixed(1) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalCustomers: totalTokens,
                completedQueues,
                activeQueues,
                averageWaitingTime: avgWait,
                hourlyData,
                serviceData
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update user status or role
exports.updateUser = async (req, res) => {
    try {
        const updateData = {};
        if (req.body.status) updateData.status = req.body.status;
        if (req.body.role) updateData.role = req.body.role;

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all counters
exports.getCounters = async (req, res) => {
    try {
        const counters = await Counter.find().populate('staff', 'name');
        
        // Check for daily QR refresh
        const today = new Date().toISOString().split('T')[0];
        const updatedCounters = await Promise.all(counters.map(async (counter) => {
            const lastUpdate = counter.lastQrUpdate ? counter.lastQrUpdate.toISOString().split('T')[0] : '';
            if (lastUpdate !== today || !counter.qrCode) {
                const qrUrl = `http://localhost:3000/scan/${counter._id}?date=${today}`;
                counter.qrCode = await QRCode.toDataURL(qrUrl);
                counter.lastQrUpdate = new Date();
                await counter.save();
            }
            return counter;
        }));

        res.status(200).json({ success: true, data: updatedCounters });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new counter
exports.createCounter = async (req, res) => {
    try {
        const counter = new Counter({
            counterName: req.body.counterName,
            status: 'Inactive'
        });

        // Generate QR Code with daily secret (simulated with date for now)
        const dateStr = new Date().toISOString().split('T')[0];
        const qrUrl = `http://localhost:3000/scan/${counter._id}?date=${dateStr}`;
        const qrImage = await QRCode.toDataURL(qrUrl);
        
        counter.qrCode = qrImage;
        await counter.save();

        res.status(201).json({ success: true, data: counter });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update counter
// @route   PUT /api/admin/counters/:id
// @access  Private/Admin
exports.updateCounter = async (req, res) => {
    try {
        const { counterName, staff, status, avgWaitTime } = req.body;
        const updateData = {};
        if (counterName) updateData.counterName = counterName;
        if (staff !== undefined) {
            updateData.staff = (staff === '' || staff === 'unassigned') ? null : staff;
        }
        if (status) updateData.status = status;
        if (avgWaitTime !== undefined) updateData.avgWaitTime = Number(avgWaitTime);

        const counter = await Counter.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('staff', 'name');
        
        // Broadcast update
        const io = req.app.get('io');
        if (io) io.emit('counter_updated', counter);

        res.status(200).json({ success: true, data: counter });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
