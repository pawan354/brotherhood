require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ─────────────────────────────────────────────────────────────────
// FRONTEND_URL is set to your Vercel URL in production (e.g. https://brotherhood.vercel.app)
// Falls back to allowing localhost for local development
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.trim());
}

console.log('✅ Allowed CORS origins:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. curl, Postman, Render health checks)
        if (!origin) return callback(null, true);
        // Exact match (trimmed to handle invisible whitespace)
        if (allowedOrigins.includes(origin.trim())) return callback(null, true);
        // Allow any brotherhood *.vercel.app URL (covers preview deployments too)
        if (origin.includes('brotherhood') && origin.endsWith('.vercel.app')) return callback(null, true);
        console.warn('CORS blocked origin:', origin);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ─── Middleware ───────────────────────────────────────────────────────────
app.use(bodyParser.json());
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
    });
});

// ─── Root ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'BrotherHood API is running 🚀' });
});

// ─── Connect MongoDB & Start Server ───────────────────────────────────────
async function startServer() {
    try {
        if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<username>')) {
            console.warn('\n⚠️  WARNING: MONGO_URI not set in .env — running without database.\n   Auth and order saving will not work.\n   Set MONGO_URI in backend/.env to enable full functionality.\n');
        } else {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ MongoDB Connected successfully');
        }

        app.listen(PORT, () => {
            console.log(`
    ╔══════════════════════════════════════════════╗
    ║        BrotherHood MERN Backend              ║
    ║  URL:  http://localhost:${PORT}                  ║
    ║  DB:   MongoDB (Mongoose)                    ║
    ║  Auth: JWT                                   ║
    ╚══════════════════════════════════════════════╝
            `);
        });
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message);
        console.log('\n💡 Tip: Set your MONGO_URI in backend/.env\n');

        // Still start the server even if DB fails
        app.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT} (DB offline)`);
        });
    }
}

startServer();
