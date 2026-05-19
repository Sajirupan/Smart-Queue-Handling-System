const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private (Customer)
exports.submitFeedback = async (req, res) => {
    try {
        const { rating, message, serviceType, tokenNumber } = req.body;
        if (!rating) return res.status(400).json({ success: false, message: 'Rating is required' });

        const feedback = await Feedback.create({
            user: req.user?.id || null,
            customerName: req.user?.name || 'Anonymous',
            rating: Number(rating),
            message,
            serviceType,
            tokenNumber
        });

        res.status(201).json({ success: true, data: feedback });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(100);

        const total = feedbacks.length;
        const avgRating = total > 0
            ? (feedbacks.reduce((s, f) => s + f.rating, 0) / total).toFixed(1)
            : 0;

        res.status(200).json({ success: true, data: feedbacks, avgRating, total });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
