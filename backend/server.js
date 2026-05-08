const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "http://localhost:3000", 
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Security Middlewares
app.use(helmet());
// app.use(mongoSanitize());
// app.use(xss());
app.use(hpp());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});
app.use(limiter);

// Route files
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const queue = require('./routes/queue');
const staff = require('./routes/staff');
// const customer = require('./routes/customer');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/queue', queue);
app.use('/api/staff', staff);
// app.use('/api/customer', customer);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => console.log('User disconnected'));
});

// Make io accessible to our routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
