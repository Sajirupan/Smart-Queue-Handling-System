const express = require('express');
const { getCounters, assignCounter, callNext, completeService } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('staff', 'admin'));

router.get('/counters', getCounters);
router.post('/assign-counter', assignCounter);
router.post('/call-next', callNext);
router.post('/complete', completeService);

module.exports = router;
