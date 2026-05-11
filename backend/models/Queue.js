const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
    tokenNumber: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    customerName: String,
    phoneNumber: String,
    serviceType: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Regular', 'Normal', 'VIP', 'Emergency'],
        default: 'Normal',
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
    priorityLevel: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Queue', QueueSchema);
