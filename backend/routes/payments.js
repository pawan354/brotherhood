const express = require('express');
const router = express.Router();

// Razorpay Setup
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// ─── GET /api/payments/config ─────────────────────────────────────────────
// Returns the public Razorpay key_id so the frontend can use it safely
router.get('/config', (req, res) => {
    res.json({ razorpayKeyId: process.env.RAZORPAY_KEY_ID || '' });
});

// ─── POST /api/payments/create-razorpay-order ─────────────────────────────
router.post('/create-razorpay-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency,
            receipt: receipt || `bh_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        console.log('Razorpay order created:', order.id, '₹' + amount);
        res.status(200).json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        // The razorpay-node SDK often returns an object with a nested error property
        const errorMsg = error?.error?.description || error.message || 'Failed to create Razorpay order. Check API keys.';
        res.status(500).json({ error: errorMsg });
    }
});

// ─── POST /api/payments/process-payment-mock ──────────────────────────────
router.post('/process-payment-mock', (req, res) => {
    const { amount } = req.body;
    console.log(`Processing mock payment of ₹${amount}`);
    setTimeout(() => {
        res.status(200).json({
            success: true,
            orderId: `BH-${Math.floor(Math.random() * 100000)}`,
            message: 'Payment processed successfully (MOCK)',
        });
    }, 1500);
});

module.exports = router;
