const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
    tokenNumber: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceType: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Regular', 'Elderly', 'VIP', 'Emergency'],
        default: 'Regular',
    },
    status: {
        type: String,
        enum: ['Waiting', 'Serving', 'Completed', 'Skipped'],
        default: 'Waiting',
    },
    counter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Counter',
    },
    waitingTime: Number,
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Queue', QueueSchema);
