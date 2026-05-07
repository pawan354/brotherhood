const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    qty: Number,
    image: String,
    size: String,
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow guest orders
    },
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    shippingAddress: {
        type: String,
        default: '',
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'Paid',
        enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
    },
    // Payment IDs
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    stripeSessionId: { type: String, default: '' },
    paymentMethod: {
        type: String,
        default: 'stripe',
        enum: ['stripe', 'razorpay', 'mock'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
