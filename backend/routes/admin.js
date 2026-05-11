const express = require('express');
const { getStats, getUsers, getCounters, createCounter, updateCounter, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/counters', getCounters);
router.post('/counters', createCounter);
router.put('/counters/:id', updateCounter);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
