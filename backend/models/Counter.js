const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
    counterName: {
        type: String,
        required: true,
        unique: true,
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Paused'],
        default: 'Inactive',
    },
    qrCode: String,
    lastQrUpdate: {
        type: Date,
        default: Date.now
    },
    currentToken: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Queue',
    },
}, { timestamps: true });

module.exports = mongoose.model('Counter', CounterSchema);
