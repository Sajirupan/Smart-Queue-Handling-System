const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

let models = null;

const defineModels = () => {
    if (models) return models;

    const sequelize = getSequelize();
    
    const User = sequelize.define('User', {
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.ENUM('admin', 'staff', 'customer'), defaultValue: 'customer' },
        phone: { type: DataTypes.STRING }
    });

    const Queue = sequelize.define('Queue', {
        tokenNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
        customerName: { type: DataTypes.STRING, allowNull: false },
        serviceType: { type: DataTypes.STRING, allowNull: false },
        priority: { type: DataTypes.ENUM('Regular', 'Elderly', 'VIP', 'Emergency'), defaultValue: 'Regular' },
        status: { type: DataTypes.ENUM('Waiting', 'Serving', 'Completed', 'Skipped'), defaultValue: 'Waiting' },
        assignedCounter: { type: DataTypes.INTEGER, allowNull: true },
        waitingTime: { type: DataTypes.INTEGER, defaultValue: 0 },
        userId: { type: DataTypes.INTEGER, allowNull: true }
    });

    const Counter = sequelize.define('Counter', {
        counterName: { type: DataTypes.STRING, allowNull: false, unique: true },
        status: { type: DataTypes.ENUM('Active', 'Inactive', 'Paused'), defaultValue: 'Active' },
        staffAssigned: { type: DataTypes.INTEGER, allowNull: true },
        currentToken: { type: DataTypes.STRING, allowNull: true }
    });

    const Report = sequelize.define('Report', {
        totalCustomers: { type: DataTypes.INTEGER, defaultValue: 0 },
        completedQueues: { type: DataTypes.INTEGER, defaultValue: 0 },
        averageWaitingTime: { type: DataTypes.INTEGER, defaultValue: 0 },
        generatedDate: { type: DataTypes.DATEONLY, allowNull: false, unique: true }
    });

    // Relationships
    User.hasMany(Queue, { foreignKey: 'userId' });
    Queue.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

    User.hasOne(Counter, { foreignKey: 'staffAssigned' });
    Counter.belongsTo(User, { foreignKey: 'staffAssigned', as: 'staff' });

    Counter.hasMany(Queue, { foreignKey: 'assignedCounter' });
    Queue.belongsTo(Counter, { foreignKey: 'assignedCounter', as: 'counter' });

    models = { User, Queue, Counter, Report };
    return models;
};

const getModels = () => {
    if (!models) {
        throw new Error("Models are not initialized yet!");
    }
    return models;
};

module.exports = { defineModels, getModels };
