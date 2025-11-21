const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

// Startup info to help diagnose deployment issues (safe-to-print items only)
console.log('NODE_ENV=', process.env.NODE_ENV || 'not-set');
console.log('PORT=', process.env.PORT || 'not-set');
console.log('MONGODB_URI set=', !!process.env.MONGODB_URI);

// Global handlers to surface crashes in Render logs
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // optional: exit process to allow platform to restart
    // process.exit(1);
});

// --- Configuration for Deployed CORS ---
// IMPORTANT: The frontend URL (e.g., https://my-frontend.onrender.com) MUST be set in the CORS_ORIGIN environment variable.


const rawClient = process.env.CLIENT_URL || process.env.CORS_ORIGIN || '';
const allowedOrigins = rawClient
    ? rawClient.split(',').map(s => s.trim()).filter(Boolean)
    : (process.env.NODE_ENV === 'development' ? ['http://localhost:5173'] : []);

if (allowedOrigins.length === 0) {
    console.warn('No CLIENT_URL/CORS_ORIGIN configured. Cross-origin requests will be restricted.');
} else {
    console.log('Allowed CORS origins:', allowedOrigins);
}

// cors origin callback ensures we only allow exact origins (required when credentials: true)
const corsOrigin = (origin, callback) => {
    // allow requests with no origin (e.g. same-origin, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // not allowed
    return callback(new Error('Not allowed by CORS'));
};
// ---------------------------------------

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

const app = express();

// --- Middleware: CORS Configuration ---
app.use(cors({
        origin: corsOrigin,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, // MUST be true if your login/auth uses cookies or sessions.
        optionsSuccessStatus: 200 
}));
// --------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
// Removed deprecated options: useNewUrlParser and useUnifiedTopology
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventopia')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'Eventopia API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
