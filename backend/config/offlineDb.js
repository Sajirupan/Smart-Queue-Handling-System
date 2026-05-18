const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-Memory Database Store
const offlineDb = {
    users: [],
    queues: [],
    counters: []
};

// Seed Initial Data
const seedOfflineData = async () => {
    try {
        console.log('🌱 [Offline DB] Seeding default in-memory data...');
        
        // Hashing seed passwords
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('password123', salt);
        const staffPassword = await bcrypt.hash('password123', salt);

        // 1. Seed Users
        offlineDb.users = [
            createUserDoc({
                _id: 'user_admin_001',
                name: 'Admin User',
                email: 'admin@smartqueue.com',
                password: adminPassword,
                role: 'admin',
                phone: '123-456-7890',
                status: 'active'
            }),
            createUserDoc({
                _id: 'user_staff_001',
                name: 'Staff Member',
                email: 'staff@smartqueue.com',
                password: staffPassword,
                role: 'staff',
                phone: '987-654-3210',
                status: 'active'
            })
        ];

        // 2. Seed Counters
        offlineDb.counters = [
            createCounterDoc({
                _id: 'counter_001',
                counterName: 'Counter 1',
                status: 'Inactive',
                staff: null,
                currentToken: null
            }),
            createCounterDoc({
                _id: 'counter_002',
                counterName: 'Counter 2',
                status: 'Inactive',
                staff: null,
                currentToken: null
            }),
            createCounterDoc({
                _id: 'counter_003',
                counterName: 'Counter 3',
                status: 'Inactive',
                staff: null,
                currentToken: null
            })
        ];

        console.log(`✅ [Offline DB] Seeded ${offlineDb.users.length} users and ${offlineDb.counters.length} counters successfully.`);
    } catch (err) {
        console.error('❌ [Offline DB] Error seeding data:', err);
    }
};

// Helper: Match MongoDB Filter Object
function matchFilter(item, filter) {
    if (!filter) return true;
    for (const key in filter) {
        const val = filter[key];
        
        // Handle _id or id mapping
        let itemValue = item[key];
        if (key === '_id' && item.id && !item._id) {
            itemValue = item.id;
        }

        if (val && typeof val === 'object' && !(val instanceof Date)) {
            // Handle $gte (greater than or equal to)
            if ('$gte' in val) {
                if (itemValue < val.$gte) return false;
            }
            // Handle $in (array includes)
            if ('$in' in val) {
                if (!val.$in.includes(itemValue)) return false;
            }
            // Handle $exists
            if ('$exists' in val) {
                const exists = val.$exists;
                const hasKey = key in item;
                if (exists !== hasKey) return false;
            }
        } else {
            if (itemValue !== val) return false;
        }
    }
    return true;
}

// Helper: Populate Related Fields
function populateItem(item, path) {
    if (!item) return;
    
    // Resolve path string or object
    const targetPath = typeof path === 'object' ? path.path : path;
    
    if (targetPath === 'staff') {
        if (item.staff) {
            const staffId = typeof item.staff === 'object' ? item.staff._id : item.staff;
            const u = offlineDb.users.find(user => user._id.toString() === staffId.toString());
            if (u) {
                item.staff = { _id: u._id, id: u.id, name: u.name, email: u.email, role: u.role };
            }
        }
    }
    
    if (targetPath === 'user') {
        if (item.user) {
            const userId = typeof item.user === 'object' ? item.user._id : item.user;
            const u = offlineDb.users.find(user => user._id.toString() === userId.toString());
            if (u) {
                item.user = { _id: u._id, id: u.id, name: u.name, email: u.email, role: u.role };
            }
        }
    }

    if (targetPath === 'currentToken') {
        if (item.currentToken) {
            const tokenId = typeof item.currentToken === 'object' ? item.currentToken._id : item.currentToken;
            const q = offlineDb.queues.find(queue => queue._id.toString() === tokenId.toString());
            if (q) {
                item.currentToken = q;
            }
        }
    }
}

// Chainable Mongoose Query Mock Builder
function createQueryChain(result, isSingle = false) {
    const chain = {
        // Support direct await (thenable)
        then(resolve, reject) {
            let finalResult = result;
            if (isSingle && Array.isArray(result)) {
                finalResult = result[0] || null;
            }
            return Promise.resolve(finalResult).then(resolve, reject);
        },
        
        select(fields) {
            // Simulated select (no-op since we can keep the fields)
            return chain;
        },
        
        sort(criteria) {
            if (Array.isArray(result) && criteria) {
                result.sort((a, b) => {
                    for (const key in criteria) {
                        const direction = criteria[key];
                        if (a[key] < b[key]) return -1 * direction;
                        if (a[key] > b[key]) return 1 * direction;
                    }
                    return 0;
                });
            }
            return chain;
        },
        
        populate(path) {
            if (Array.isArray(result)) {
                result.forEach(item => populateItem(item, path));
            } else if (result) {
                populateItem(result, path);
            }
            return chain;
        }
    };
    return chain;
}

// Model Document Factories (wrappers containing save/update methods)
function createUserDoc(data) {
    const doc = {
        _id: data._id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'customer',
        phone: data.phone,
        status: data.status || 'active',
        avatar: data.avatar || 'default-avatar.png',
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        
        async matchPassword(enteredPassword) {
            if (enteredPassword === this.password) return true;
            try {
                return await bcrypt.compare(enteredPassword, this.password);
            } catch (e) {
                return false;
            }
        },
        
        getSignedJwtToken() {
            return jwt.sign(
                { id: this._id, role: this.role }, 
                process.env.JWT_SECRET || 'super_secret_key_123_abc', 
                { expiresIn: process.env.JWT_EXPIRE || '30d' }
            );
        },
        
        async save() {
            const idx = offlineDb.users.findIndex(u => u._id.toString() === this._id.toString());
            this.updatedAt = new Date();
            if (idx !== -1) {
                offlineDb.users[idx] = this;
            } else {
                offlineDb.users.push(this);
            }
            console.log(`💾 [Offline DB] Saved user: ${this.email}`);
            return this;
        }
    };
    doc.id = doc._id;
    return doc;
}

function createQueueDoc(data) {
    const doc = {
        _id: data._id || `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tokenNumber: data.tokenNumber,
        user: data.user || null,
        customerName: data.customerName || 'Guest',
        phoneNumber: data.phoneNumber || null,
        serviceType: data.serviceType,
        priority: data.priority || 'Normal',
        priorityLevel: data.priorityLevel || 1,
        status: data.status || 'Waiting',
        counter: data.counter || null,
        waitingTime: data.waitingTime || 0,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        
        async save() {
            const idx = offlineDb.queues.findIndex(q => q._id.toString() === this._id.toString());
            this.updatedAt = new Date();
            if (idx !== -1) {
                offlineDb.queues[idx] = this;
            } else {
                offlineDb.queues.push(this);
            }
            console.log(`💾 [Offline DB] Saved token: ${this.tokenNumber} [${this.status}]`);
            return this;
        }
    };
    doc.id = doc._id;
    return doc;
}

function createCounterDoc(data) {
    const doc = {
        _id: data._id || `counter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        counterName: data.counterName,
        staff: data.staff || null,
        status: data.status || 'Inactive',
        qrCode: data.qrCode || null,
        lastQrUpdate: data.lastQrUpdate || new Date(),
        currentToken: data.currentToken || null,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        
        async save() {
            const idx = offlineDb.counters.findIndex(c => c._id.toString() === this._id.toString());
            this.updatedAt = new Date();
            if (idx !== -1) {
                offlineDb.counters[idx] = this;
            } else {
                offlineDb.counters.push(this);
            }
            console.log(`💾 [Offline DB] Saved counter: ${this.counterName} [${this.status}]`);
            return this;
        }
    };
    doc.id = doc._id;
    return doc;
}

// ----------------- Mock Models implementations -----------------

const UserMock = {
    find(filter = {}) {
        console.log('🔍 [Offline DB] User.find with filter:', filter);
        const matched = offlineDb.users.filter(u => matchFilter(u, filter));
        return createQueryChain(matched.map(u => createUserDoc(u)));
    },
    
    findOne(filter = {}) {
        console.log('🔍 [Offline DB] User.findOne with filter:', filter);
        const matched = offlineDb.users.filter(u => matchFilter(u, filter));
        return createQueryChain(matched.length > 0 ? createUserDoc(matched[0]) : null, true);
    },
    
    findById(id) {
        console.log(`🔍 [Offline DB] User.findById: ${id}`);
        const found = offlineDb.users.find(u => u._id.toString() === id.toString());
        return createQueryChain(found ? createUserDoc(found) : null, true);
    },
    
    async create(userData) {
        console.log('➕ [Offline DB] User.create:', userData.email);
        
        // Password hash simulating mongoose pre-save hook
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const newUser = createUserDoc({
            ...userData,
            password: hashedPassword
        });
        offlineDb.users.push(newUser);
        return newUser;
    },
    
    findByIdAndUpdate(id, updateData, options = {}) {
        console.log(`📝 [Offline DB] User.findByIdAndUpdate: ${id}`);
        const idx = offlineDb.users.findIndex(u => u._id.toString() === id.toString());
        if (idx !== -1) {
            const current = offlineDb.users[idx];
            
            // Clean/filter properties
            const updated = {
                ...current,
                ...updateData,
                updatedAt: new Date()
            };
            offlineDb.users[idx] = createUserDoc(updated);
            return createQueryChain(offlineDb.users[idx], true);
        }
        return createQueryChain(null, true);
    },
    
    findByIdAndDelete(id) {
        console.log(`❌ [Offline DB] User.findByIdAndDelete: ${id}`);
        const idx = offlineDb.users.findIndex(u => u._id.toString() === id.toString());
        if (idx !== -1) {
            const deleted = offlineDb.users.splice(idx, 1)[0];
            return Promise.resolve(deleted);
        }
        return Promise.resolve(null);
    },
    
    countDocuments(filter = {}) {
        const count = offlineDb.users.filter(u => matchFilter(u, filter)).length;
        return Promise.resolve(count);
    }
};

const QueueMock = {
    find(filter = {}) {
        console.log('🔍 [Offline DB] Queue.find with filter:', filter);
        const matched = offlineDb.queues.filter(q => matchFilter(q, filter));
        return createQueryChain(matched.map(q => createQueueDoc(q)));
    },
    
    findOne(filter = {}) {
        console.log('🔍 [Offline DB] Queue.findOne with filter:', filter);
        const matched = offlineDb.queues.filter(q => matchFilter(q, filter));
        // Return a single element, but wrap in a chain to allow sorting
        return createQueryChain(matched.map(q => createQueueDoc(q)), true);
    },
    
    findById(id) {
        console.log(`🔍 [Offline DB] Queue.findById: ${id}`);
        const found = offlineDb.queues.find(q => q._id.toString() === id.toString());
        return createQueryChain(found ? createQueueDoc(found) : null, true);
    },
    
    create(queueData) {
        console.log('➕ [Offline DB] Queue.create for:', queueData.customerName);
        const newQueue = createQueueDoc(queueData);
        offlineDb.queues.push(newQueue);
        return Promise.resolve(newQueue);
    },
    
    findByIdAndUpdate(id, updateData, options = {}) {
        console.log(`📝 [Offline DB] Queue.findByIdAndUpdate: ${id}`);
        const idx = offlineDb.queues.findIndex(q => q._id.toString() === id.toString());
        if (idx !== -1) {
            const current = offlineDb.queues[idx];
            const updated = {
                ...current,
                ...updateData,
                updatedAt: new Date()
            };
            offlineDb.queues[idx] = createQueueDoc(updated);
            return createQueryChain(offlineDb.queues[idx], true);
        }
        return createQueryChain(null, true);
    },
    
    countDocuments(filter = {}) {
        const count = offlineDb.queues.filter(q => matchFilter(q, filter)).length;
        return Promise.resolve(count);
    }
};

const CounterMock = {
    find(filter = {}) {
        console.log('🔍 [Offline DB] Counter.find with filter:', filter);
        const matched = offlineDb.counters.filter(c => matchFilter(c, filter));
        return createQueryChain(matched.map(c => createCounterDoc(c)));
    },
    
    findOne(filter = {}) {
        console.log('🔍 [Offline DB] Counter.findOne with filter:', filter);
        const matched = offlineDb.counters.filter(c => matchFilter(c, filter));
        return createQueryChain(matched.length > 0 ? createCounterDoc(matched[0]) : null, true);
    },
    
    findById(id) {
        console.log(`🔍 [Offline DB] Counter.findById: ${id}`);
        const found = offlineDb.counters.find(c => c._id.toString() === id.toString());
        return createQueryChain(found ? createCounterDoc(found) : null, true);
    },
    
    create(counterData) {
        console.log('➕ [Offline DB] Counter.create:', counterData.counterName);
        const newCounter = createCounterDoc(counterData);
        offlineDb.counters.push(newCounter);
        return Promise.resolve(newCounter);
    },
    
    findByIdAndUpdate(id, updateData, options = {}) {
        console.log(`📝 [Offline DB] Counter.findByIdAndUpdate: ${id}`);
        const idx = offlineDb.counters.findIndex(c => c._id.toString() === id.toString());
        if (idx !== -1) {
            const current = offlineDb.counters[idx];
            const updated = {
                ...current,
                ...updateData,
                updatedAt: new Date()
            };
            offlineDb.counters[idx] = createCounterDoc(updated);
            return createQueryChain(offlineDb.counters[idx], true);
        }
        return createQueryChain(null, true);
    },
    
    updateMany(filter = {}, updateData = {}) {
        console.log('📝 [Offline DB] Counter.updateMany with filter:', filter);
        let count = 0;
        offlineDb.counters.forEach((counter, idx) => {
            if (matchFilter(counter, filter)) {
                const updated = {
                    ...counter,
                    ...updateData,
                    updatedAt: new Date()
                };
                offlineDb.counters[idx] = createCounterDoc(updated);
                count++;
            }
        });
        return Promise.resolve({ nModified: count, n: count, ok: 1 });
    },
    
    countDocuments(filter = {}) {
        const count = offlineDb.counters.filter(c => matchFilter(c, filter)).length;
        return Promise.resolve(count);
    }
};

// Initial seed
seedOfflineData();

module.exports = {
    store: offlineDb,
    User: UserMock,
    Queue: QueueMock,
    Counter: CounterMock
};
