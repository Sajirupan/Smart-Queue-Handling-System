const express = require('express');
const { getModels } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { Op, fn, col } = require('sequelize');

const router = express.Router();

router.get('/daily', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    try {
        const { Queue } = getModels();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const totalCustomers = await Queue.count({
            where: { createdAt: { [Op.gte]: startOfDay } }
        });

        const completedQueues = await Queue.count({
            where: { createdAt: { [Op.gte]: startOfDay }, status: 'Completed' }
        });

        const activeQueues = await Queue.count({
            where: { createdAt: { [Op.gte]: startOfDay }, status: { [Op.in]: ['Waiting', 'Serving'] } }
        });

        // Calculate Average Waiting Time (Simple mock for now, can be expanded)
        const averageWaitingTime = 12; 

        // Hourly Data for Recharts
        const hourlyStats = await Queue.findAll({
            attributes: [
                [fn('HOUR', col('createdAt')), 'hour'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: { createdAt: { [Op.gte]: startOfDay } },
            group: [fn('HOUR', col('createdAt'))],
            raw: true
        });

        // Weekly Data for Recharts
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        const weeklyStats = await Queue.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: { createdAt: { [Op.gte]: startOfWeek } },
            group: [fn('DATE', col('createdAt'))],
            raw: true
        });

        // Service Distribution for Pie Chart
        const serviceStats = await Queue.findAll({
            attributes: [
                'serviceType',
                [fn('COUNT', col('id')), 'count']
            ],
            where: { createdAt: { [Op.gte]: startOfDay } },
            group: ['serviceType'],
            raw: true
        });

        res.json({ 
            totalCustomers, 
            completedQueues, 
            averageWaitingTime, 
            activeQueues,
            hourlyData: hourlyStats,
            weeklyData: weeklyStats,
            serviceData: serviceStats
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
