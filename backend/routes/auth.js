const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign a JWT
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide name, email, and password.' });
        }

        // Check if user already exists
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const user = await User.create({ name, email, password });
        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to BrotherHood.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        console.error('Register Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = signToken(user._id);

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            createdAt: req.user.createdAt,
        },
    });
});

module.exports = router;
