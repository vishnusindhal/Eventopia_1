const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

// --- Configuration for Deployed CORS ---
// IMPORTANT: The frontend URL (e.g., https://my-frontend.onrender.com) MUST be set in the CORS_ORIGIN environment variable.
const allowedOrigin = process.env.CLIENT_URL; 

if (!allowedOrigin) {
    console.warn("CORS_ORIGIN environment variable is not set. API access may be restricted or improperly configured.");
}
// ---------------------------------------

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

const app = express();

// --- Middleware: CORS Configuration ---
app.use(cors({
    origin: allowedOrigin,
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
