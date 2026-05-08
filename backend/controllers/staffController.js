const Queue = require('../models/Queue');
const Counter = require('../models/Counter');
const User = require('../models/User');

// @desc    Get all counters
// @route   GET /api/staff/counters
// @access  Private/Staff
exports.getCounters = async (req, res) => {
    try {
        const counters = await Counter.find().populate('staff', 'name');
        res.status(200).json({ success: true, data: counters });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Assign staff to counter
// @route   POST /api/staff/assign-counter
// @access  Private/Staff
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

// ... previous callNext and completeService logic ...
exports.callNext = async (req, res) => {
    try {
        const { counterId } = req.body;

        const nextCustomer = await Queue.findOne({ status: 'Waiting' })
            .sort({ priority: -1, createdAt: 1 });

        if (!nextCustomer) {
            return res.status(404).json({ success: false, message: 'No customers in queue' });
        }

        nextCustomer.status = 'Serving';
        nextCustomer.counter = counterId;
        await nextCustomer.save();

        await Counter.findByIdAndUpdate(counterId, {
            currentToken: nextCustomer._id
        });

        const io = req.app.get('io');
        io.emit('queue_updated');

        // Notification Logic: Find the 5th person in queue and notify them
        const upcomingQueue = await Queue.find({ status: 'Waiting' })
            .sort({ priority: -1, createdAt: 1 })
            .limit(5);
        
        if (upcomingQueue.length === 5) {
            const fifthPerson = upcomingQueue[4];
            console.log(`[NOTIFICATION] Sending SMS/Email to ${fifthPerson.customerName || 'Customer'}: You are 5th in line. Please be ready!`);
            // Here you would call nodemailer or twilio
        }

        res.status(200).json({ success: true, data: nextCustomer });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.completeService = async (req, res) => {
    try {
        const { counterId } = req.body;
        const counter = await Counter.findById(counterId);
        
        if (counter.currentToken) {
            await Queue.findByIdAndUpdate(counter.currentToken, { status: 'Completed' });
        }

        counter.currentToken = null;
        await counter.save();

        const io = req.app.get('io');
        io.emit('queue_updated');

        res.status(200).json({ success: true, message: 'Service completed' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
