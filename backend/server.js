const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

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

// --- CORS Configuration ---
// Set CLIENT_URL in your environment to a comma-separated list of allowed
// frontend origins.  Examples:
//   Local dev  → CLIENT_URL=http://localhost:5173
//   Production → CLIENT_URL=https://eventopia-1.vercel.app
//   Both       → CLIENT_URL=http://localhost:5173,https://eventopia-1.vercel.app
//
// The CORS_ORIGIN variable is also checked as a fallback alias.

const rawClient = (process.env.CLIENT_URL || process.env.CORS_ORIGIN || '').trim();

// Parse comma-separated origins and deduplicate
const allowedOrigins = rawClient
    ? [...new Set(rawClient.split(',').map(s => s.trim()).filter(Boolean))]
    : (process.env.NODE_ENV === 'development' ? ['http://localhost:5173'] : []);

if (allowedOrigins.length === 0) {
    console.warn('[CORS] No CLIENT_URL/CORS_ORIGIN configured. Cross-origin requests will be blocked.');
} else {
    console.log('[CORS] Allowed origins:', allowedOrigins);
}

// Strict origin callback — required when credentials: true
const corsOrigin = (origin, callback) => {
    // Allow requests with no Origin header (same-origin, curl, mobile apps, Render health checks)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // In development mode, allow any localhost origin (e.g., localhost:5173, localhost:5174, etc.)
    if (process.env.NODE_ENV === 'development' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
    }

    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(new Error(`Origin '${origin}' not allowed by CORS`));
};
// -----------------------------------

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const subscriptionRoutes = require('./routes/subscriptions');
const notificationRoutes = require('./routes/notifications');
const preferencesRoutes = require('./routes/preferences');

// Import services
const socketService = require('./services/socketService');
const { startCronJobs } = require('./services/cronService');

const app = express();

// ── Rate Limiting ─────────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                 // limit each IP to 200 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

// --- Middleware: CORS Configuration ---
app.use(cors({
        origin: corsOrigin,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        credentials: true, // MUST be true if your login/auth uses cookies or sessions.
        maxAge: 86400, // Cache preflight for 24 hours
        optionsSuccessStatus: 200 
}));
// --------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Database connection
// Removed deprecated options: useNewUrlParser and useUnifiedTopology
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventopia')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/preferences', preferencesRoutes);

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

// ── Create HTTP server & attach Socket.IO ─────────────────────
const server = http.createServer(app);
socketService.init(server, allowedOrigins);

// ── Start cron jobs ───────────────────────────────────────────
startCronJobs();

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
