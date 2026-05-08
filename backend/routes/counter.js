const express = require('express');
const { getModels } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Create a new counter (Admin)
router.post('/create', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    try {
        const { Counter } = getModels();
        const { counterName, staffAssigned } = req.body;

        const counter = await Counter.create({
            counterName,
            staffAssigned: staffAssigned || null,
            status: 'Active'
        });

        res.status(201).json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get all counters
router.get('/all', async (req, res) => {
    try {
        const { Counter, User } = getModels();
        const counters = await Counter.findAll({
            include: [{ model: User, as: 'staff', attributes: ['id', 'name', 'email'] }]
        });
        res.json(counters);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update counter
router.put('/update/:id', authMiddleware, roleMiddleware(['admin', 'staff']), async (req, res) => {
    try {
        const { Counter } = getModels();
        const { status, staffAssigned, currentToken } = req.body;
        
        const counter = await Counter.findByPk(req.params.id);
        if (!counter) return res.status(404).json({ message: 'Counter not found' });

        if (status) counter.status = status;
        if (staffAssigned !== undefined) counter.staffAssigned = staffAssigned;
        if (currentToken !== undefined) counter.currentToken = currentToken;

        await counter.save();

        if (req.io) {
            req.io.emit('counter_updated', counter);
        }

        res.json(counter);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Call next customer
router.post('/call-next/:id', authMiddleware, roleMiddleware(['admin', 'staff']), async (req, res) => {
    try {
        const { Counter, Queue } = getModels();
        const counter = await Counter.findByPk(req.params.id);
        if (!counter) return res.status(404).json({ message: 'Counter not found' });

        // Find the highest priority waiting queue
        const queues = await Queue.findAll({
            where: { status: 'Waiting' }
        });

        if (queues.length === 0) {
            return res.status(400).json({ message: 'No waiting customers' });
        }

        const priorityOrder = { 'Emergency': 1, 'VIP': 2, 'Elderly': 3, 'Regular': 4 };
        queues.sort((a, b) => {
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        const nextQueue = queues[0];
        
        // Update previous currently serving if any
        if (counter.currentToken) {
            const prevQueue = await Queue.findOne({ where: { tokenNumber: counter.currentToken, status: 'Serving' }});
            if (prevQueue) {
                prevQueue.status = 'Completed';
                await prevQueue.save();
            }
        }

        // Update new queue
        nextQueue.status = 'Serving';
        nextQueue.assignedCounter = counter.id;
        await nextQueue.save();

        // Update counter
        counter.currentToken = nextQueue.tokenNumber;
        await counter.save();

        if (req.io) {
            req.io.emit('queue_updated', nextQueue);
            req.io.emit('counter_updated', counter);
            req.io.emit('call_customer', { token: nextQueue.tokenNumber, counter: counter.counterName });
        }

        res.json({ counter, nextQueue });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
