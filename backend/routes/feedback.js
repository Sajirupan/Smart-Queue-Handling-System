const express = require('express');
const { submitFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);

module.exports = router;
