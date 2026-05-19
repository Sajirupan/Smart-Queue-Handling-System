const User = require('../models/User');
const Queue = require('../models/Queue');
const Counter = require('../models/Counter');
const QRCode = require('qrcode');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTokens = await Queue.countDocuments();
        const activeQueues = await Queue.countDocuments({ status: { $in: ['Waiting', 'Serving'] } });
        const completedQueues = await Queue.countDocuments({ status: 'Completed' });

        // Calculate average waiting time (mock for now, would use logic with createdAt/updatedAt)
        const avgWait = 12; 

        res.status(200).json({
            success: true,
            data: {
                totalCustomers: totalTokens,
                completedQueues,
                averageWaitingTime: avgWait,
                activeQueues,
                hourlyData: [
                    { hour: '9am', count: 12 },
                    { hour: '10am', count: 18 },
                    { hour: '11am', count: 25 },
                    { hour: '12pm', count: 15 }
                ],
                serviceData: [
                    { name: 'Billing', value: 40 },
                    { name: 'Support', value: 30 },
                    { name: 'Account', value: 20 },
                    { name: 'Loan', value: 10 }
                ]
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
