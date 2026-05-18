const mongoose = require('mongoose');

/**
 * Wraps a Mongoose model with a Proxy to automatically fall back to an 
 * in-memory DB when the primary MongoDB connection is offline.
 * 
 * @param {string} modelName - Name of the model ('User', 'Queue', 'Counter')
 * @param {mongoose.Model} realModel - The compiled Mongoose model
 */
function wrapWithOfflineFallback(modelName, realModel) {
    return new Proxy(realModel, {
        get(target, prop, receiver) {
            // Check if Mongoose connection is ready (1 = connected)
            if (mongoose.connection.readyState === 1) {
                return Reflect.get(target, prop, receiver);
            }
            
            // Database is down or whitelisting failed. Fall back to offline db!
            const offlineDb = require('./offlineDb');
            const mockModel = offlineDb[modelName];
            
            if (mockModel && typeof mockModel[prop] === 'function') {
                // Return our custom in-memory implementation
                return mockModel[prop].bind(mockModel);
            }
            
            // If property is not found or isn't a function, default to real model behavior
            return Reflect.get(target, prop, receiver);
        }
    });
}

module.exports = { wrapWithOfflineFallback };
