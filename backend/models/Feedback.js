const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    customerName: { type: String, default: 'Anonymous' },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        maxlength: 500
    },
    serviceType: String,
    tokenNumber: String,
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
