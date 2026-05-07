const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// Helper: try sending email via Nodemailer (Gmail SMTP)
async function sendOrderEmail(order) {
    try {
        const nodemailer = require('nodemailer');
        
        // Skip if Gmail credentials aren't set
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

        // Force IPv4 resolution for Nodemailer (fixes Render ENETUNREACH IPv6 error)
        require('dns').setDefaultResultOrder('ipv4first');

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const itemRows = order.items
            .map(i => `<tr>
                <td style="padding:6px 12px; border-bottom: 1px solid #eee;">${i.name} ${i.size ? `(Size: ${i.size})` : ''}</td>
                <td style="padding:6px 12px; border-bottom: 1px solid #eee;">x${i.qty}</td>
                <td style="padding:6px 12px; border-bottom: 1px solid #eee;">₹${i.price}</td>
            </tr>`)
            .join('');

        const ownerItemRows = order.items
            .map(i => `- ${i.name} (Size: ${i.size || 'N/A'}) x${i.qty}`)
            .join('<br/>');

        // Email to Customer
        const customerMailOptions = {
            from: `"BrotherHood" <${process.env.GMAIL_USER}>`,
            to: order.customerEmail,
            subject: `🛍️ Order Confirmed! ₹${order.totalAmount} — BrotherHood`,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:4px;overflow:hidden;">
                    <h2 style="background:#0A0F14;color:#C9A66B;padding:20px;margin:0;text-align:center;letter-spacing:2px;">BROTHERHOOD</h2>
                    <div style="padding:20px;">
                        <p>Hi <strong>${order.customerName}</strong>,</p>
                        <p>Thank you for choosing BrotherHood. Your bespoke order has been confirmed and is being prepared by our tailors.</p>
                        <p><strong>Payment Ref:</strong> ${order.razorpayPaymentId || 'N/A'}</p>
                        <hr style="border:0; border-top:1px solid #eee; margin:20px 0;"/>
                        <table width="100%" style="border-collapse:collapse; text-align:left;">
                            <thead>
                                <tr style="background:#f9f9f9;">
                                    <th style="padding:10px 12px;">Item</th>
                                    <th style="padding:10px 12px;">Qty</th>
                                    <th style="padding:10px 12px;">Price</th>
                                </tr>
                            </thead>
                            <tbody>${itemRows}</tbody>
                        </table>
                        <hr style="border:0; border-top:1px solid #eee; margin:20px 0;"/>
                        <h3 style="text-align:right; color:#0A0F14;">Total: ₹${order.totalAmount}</h3>
                    </div>
                </div>
            `,
        };

        // Email to Owner
        const ownerMailOptions = {
            from: `"BrotherHood System" <${process.env.GMAIL_USER}>`,
            to: process.env.OWNER_EMAIL,
            subject: `🚨 NEW ORDER RECEIVED - ₹${order.totalAmount}`,
            html: `
                <div style="font-family:sans-serif; padding: 20px;">
                    <h2>New Order Alert</h2>
                    <p><strong>Order From:</strong> ${order.customerName} (${order.customerEmail})</p>
                    <p><strong>Address:</strong> ${order.shippingAddress || 'N/A'}</p>
                    <hr/>
                    <h3>Ordered Products:</h3>
                    <p>${ownerItemRows}</p>
                    <hr/>
                    <p><strong>Total:</strong> ₹${order.totalAmount}</p>
                    <p><strong>Payment ID:</strong> ${order.razorpayPaymentId || 'N/A'}</p>
                </div>
            `
        };

        await transporter.sendMail(customerMailOptions);
        if (process.env.OWNER_EMAIL) {
            await transporter.sendMail(ownerMailOptions);
        }
        console.log(`Order confirmation emails sent successfully.`);
    } catch (err) {
        console.error('Email send failed (non-fatal):', err.message);
    }
}

// ─── POST /api/orders ─────────────────────────────────────────────────────
// Save a new order. Auth is optional — works for both logged-in and guest.
router.post('/', async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            shippingAddress,
            items,
            totalAmount,
            razorpayOrderId,
            razorpayPaymentId,
            stripeSessionId,
            paymentMethod,
        } = req.body;

        if (!customerName || !customerEmail || !items || !totalAmount) {
            return res.status(400).json({ error: 'Missing required order fields.' });
        }

        // Try to identify user from token (optional auth)
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (_) {
                // Token invalid — still allow order as guest
            }
        }

        // ─── Save Order to DB ────────────────────────────────────────────────
        let order;
        const mongoose = require('mongoose');
        
        if (mongoose.connection.readyState === 1) {
            order = await Order.create({
                userId,
                customerName,
                customerEmail,
                shippingAddress: shippingAddress || '',
                items,
                totalAmount,
                razorpayOrderId: razorpayOrderId || '',
                razorpayPaymentId: razorpayPaymentId || '',
                stripeSessionId: stripeSessionId || '',
                paymentMethod: paymentMethod || 'razorpay',
                status: 'Paid',
            });
            console.log('✅ Order saved to MongoDB. ID:', order._id);
        } else {
            console.warn('⚠️ MongoDB offline. Order not saved, but processing continue...');
            // Create a mock order object for the email function
            order = {
                customerName,
                customerEmail,
                items,
                totalAmount,
                paymentMethod: paymentMethod || 'razorpay',
                razorpayPaymentId
            };
        }

        // Send email notification (non-blocking)
        sendOrderEmail(order);

        res.status(201).json({ success: true, order });
    } catch (err) {
        console.error('Save Order Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/orders/mine ─────────────────────────────────────────────────
// Get the logged-in user's orders (requires JWT)
router.get('/mine', protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (err) {
        console.error('Fetch Orders Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/orders ──────────────────────────────────────────────────────
// Fetch all orders by email (for guest order lookup)
router.get('/by-email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email query param required.' });

        const orders = await Order.find({ customerEmail: email.toLowerCase() }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
