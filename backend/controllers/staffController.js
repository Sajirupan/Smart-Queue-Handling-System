const Queue = require('../models/Queue');
const Counter = require('../models/Counter');
const User = require('../models/User');

// @desc    Get all counters
exports.getCounters = async (req, res) => {
    try {
        const counters = await Counter.find().populate('staff', 'name');
        res.status(200).json({ success: true, data: counters });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current staff's assigned counter info
exports.getCounterInfo = async (req, res) => {
    try {
        const counter = await Counter.findOne({ staff: req.user.id }).populate('staff', 'name');
        res.status(200).json({ success: true, data: counter });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Assign staff to counter
exports.assignCounter = async (req, res) => {
    try {
        const { counterId } = req.body;
        const staffId = req.user.id;

        // 1. Unassign staff from any previous counters
        await Counter.updateMany({ staff: staffId }, { staff: null, status: 'Inactive' });

        // 2. Assign to new counter
        const counter = await Counter.findByIdAndUpdate(counterId, {
            staff: staffId,
            status: 'Active'
        }, { new: true });

        res.status(200).json({ success: true, data: counter });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.callNext = async (req, res) => {
    try {
        const { counterId } = req.body;
        const counter = await Counter.findById(counterId);

        if (!counter) {
            return res.status(404).json({ success: false, message: 'Counter not found' });
        }

        // Get the next waiting customer
        const nextCustomer = await Queue.findOne({ status: 'Waiting' })
            .sort({ priorityLevel: -1, createdAt: 1 });

        if (!nextCustomer) {
            return res.status(404).json({ success: false, message: 'No customers in queue' });
        }

        // If there was a previous token being served, mark it as completed or skipped?
        // For now, let's just update the new one
        nextCustomer.status = 'Serving';
        nextCustomer.counter = counterId;
        await nextCustomer.save();

        counter.currentToken = nextCustomer._id;
        await counter.save();

        const io = req.app.get('io');
        io.emit('queue_updated');
        
        // Specific event for the public board to trigger sound/announcement
        io.emit('token_called', {
            tokenNumber: nextCustomer.tokenNumber,
            counterName: counter.counterName
        });

        res.status(200).json({ success: true, data: nextCustomer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.completeService = async (req, res) => {
    try {
        const { counterId } = req.body;
        const counter = await Counter.findById(counterId);
        
        if (counter && counter.currentToken) {
            await Queue.findByIdAndUpdate(counter.currentToken, { status: 'Completed' });
            counter.currentToken = null;
            await counter.save();
        }

        const io = req.app.get('io');
        io.emit('queue_updated');

        res.status(200).json({ success: true, message: 'Service completed' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateCounterTime = async (req, res) => {
    try {
        const { avgWaitTime } = req.body;
        const counter = await Counter.findOne({ staff: req.user.id });
        if (!counter) {
            return res.status(404).json({ success: false, message: 'You are not assigned to a counter' });
        }
        
        counter.avgWaitTime = Number(avgWaitTime);
        await counter.save();

        const io = req.app.get('io');
        io.emit('counter_updated', counter);

        res.status(200).json({ success: true, data: counter });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
