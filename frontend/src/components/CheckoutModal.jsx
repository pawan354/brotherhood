import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Shipping', 'Payment', 'Confirmation'];

// Lazily load the Razorpay checkout.js SDK only when needed
let razorpayScriptLoaded = false;

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (razorpayScriptLoaded && window.Razorpay) { resolve(); return; }
    // Already in DOM (e.g. HMR)
    if (document.getElementById('razorpay-sdk')) {
      razorpayScriptLoaded = true; resolve(); return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => { razorpayScriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  });
}

// Fetch and cache the public Razorpay key_id from backend
let cachedRazorpayKey = null;
async function getRazorpayKey() {
  if (cachedRazorpayKey) return cachedRazorpayKey;
  const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/config`);
  const data = await res.json();
  cachedRazorpayKey = data.razorpayKeyId;
  return cachedRazorpayKey;
}

export default function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { token, user, isLoggedIn } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  // Shipping form refs
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const addressRef = useRef();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSuccess(false);
      setError('');
      setOrderId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!loading) onClose();
  };

  // ─── Step 1 → Step 2 validation ─────────────────────────────────────────
  const handleNextStep = () => {
    if (
      (!isLoggedIn && (!firstNameRef.current?.value.trim() || !lastNameRef.current?.value.trim() || !emailRef.current?.value.trim())) ||
      !addressRef.current?.value.trim()
    ) {
      setError('Please fill in all shipping fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  // ─── Save order to MongoDB ────────────────────────────────────────────────
  const saveOrderToMongo = async ({ paymentId, razorpayOrderId, customerName, customerEmail, shippingAddress }) => {
    const orderItems = cartItems.map(({ product, size, quantity }) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      image: product.image,
      size,
    }));

    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          shippingAddress,
          items: orderItems,
          totalAmount: cartTotal,
          razorpayOrderId,
          razorpayPaymentId: paymentId,
          paymentMethod: 'razorpay',
        }),
      });
    } catch (err) {
      console.warn('Order save failed (non-fatal):', err.message);
    }
  };

  // ─── Razorpay Checkout ────────────────────────────────────────────────────
  const handlePayNow = async (e) => {
    e.preventDefault();
    setStep(3);
    setLoading(true);
    setError('');

    const customerName = isLoggedIn ? user.name : `${firstNameRef.current.value.trim()} ${lastNameRef.current.value.trim()}`;
    const customerEmail = isLoggedIn ? user.email : emailRef.current.value.trim();
    const shippingAddress = addressRef.current.value.trim();

    try {
      // 1. Lazily inject Razorpay SDK + get public key
      await loadRazorpayScript();
      const razorpayKeyId = await getRazorpayKey();

      // 2. Create Razorpay order on backend
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          currency: 'INR',
          receipt: `bh_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Failed to create order');
      }

      const razorpayOrder = await orderRes.json();
      setLoading(false);

      // 3. Open Razorpay checkout popup
      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,      // in paise
        currency: razorpayOrder.currency,
        name: 'BrotherHood',
        description: 'Bespoke Menswear',
        image: '/brotherhood_logo.png',
        order_id: razorpayOrder.id,
        prefill: {
          name: customerName,
          email: customerEmail,
        },
        notes: { shippingAddress },
        theme: { color: '#C9A66B' },

        // ── Success handler ─────────────────────────────────────────────
        handler: async function (response) {
          // response.razorpay_payment_id
          // response.razorpay_order_id
          // response.razorpay_signature

          setStep(3);
          setLoading(true);

          await saveOrderToMongo({
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            customerName,
            customerEmail,
            shippingAddress,
          });

          // Save to localStorage as fallback
          const localOrder = {
            id: `#BH-${Date.now()}`,
            date: new Date().toLocaleDateString(),
            total: cartTotal,
            items: cartItems.length,
            status: 'Paid',
          };
          const stored = JSON.parse(localStorage.getItem('bh_orders') || '[]');
          stored.unshift(localOrder);
          localStorage.setItem('bh_orders', JSON.stringify(stored));

          clearCart();
          setOrderId(response.razorpay_payment_id);
          setLoading(false);
          setSuccess(true);
        },

        // ── Modal dismiss (user closed without paying) ──────────────────
        modal: {
          ondismiss: () => {
            setStep(2); // go back to payment step
            setError('Payment was cancelled. Please try again.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setStep(2);
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      setLoading(false);
      setStep(2);
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to backend. Make sure the server is running.'
          : err.message
      );
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex justify-center items-center p-4 animate-[fadeIn_0.3s_ease-out]" onClick={handleClose}>
      <div
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl leading-none" onClick={handleClose} disabled={loading}>×</button>

        {/* Step indicator dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {STEPS.map((label, i) => (
            <div
              key={label}
              title={label}
              style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: step > i ? 'var(--color-accent-gold)' : 'rgba(0,0,0,0.15)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        <form onSubmit={handlePayNow}>

          {/* ── Step 1: Shipping Details ── */}
          <div className={`${step === 1 ? 'block' : 'hidden'} animate-[fadeIn_0.3s_ease-out]`}>
            <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-6 text-center">Shipping Details</h2>

            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            {!isLoggedIn && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">First Name</label>
                    <input ref={firstNameRef} type="text" className="w-full bg-zinc-900 border border-white/10 text-white p-3 outline-none focus:border-white transition-colors" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Last Name</label>
                    <input ref={lastNameRef} type="text" className="w-full bg-zinc-900 border border-white/10 text-white p-3 outline-none focus:border-white transition-colors" placeholder="Doe" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                  <input ref={emailRef} type="email" className="w-full bg-zinc-900 border border-white/10 text-white p-3 outline-none focus:border-white transition-colors" placeholder="john@example.com" />
                </div>
              </>
            )}

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Shipping Address</label>
              <input ref={addressRef} type="text" className="w-full bg-zinc-900 border border-white/10 text-white p-3 outline-none focus:border-white transition-colors" placeholder="123 Luxury Ave, Pune" />
            </div>

            <button
              type="button"
              className="w-full bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] py-4 hover:bg-gray-200 transition-colors"
              onClick={handleNextStep}
            >
              Continue to Payment
            </button>
          </div>

          {/* ── Step 2: Payment via Razorpay ── */}
          <div className={`${step === 2 ? 'block' : 'hidden'} animate-[fadeIn_0.3s_ease-out]`}>
            <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-6 text-center">Payment</h2>

            {/* Order summary */}
            <div className="bg-zinc-900 border border-white/10 p-4 mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Order Summary</p>
              {cartItems.map(({ cartItemId, product, size, quantity }) => (
                <div key={cartItemId} className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>{product.name} ({size}) × {quantity}</span>
                  <span className="font-mono text-[#C9A66B]">₹{(product.price * quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between font-bold text-white">
                <span className="uppercase tracking-widest text-xs">Total</span>
                <span className="text-[#C9A66B] font-mono">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Razorpay badge */}
            <div className="bg-[#C9A66B]/10 border border-dashed border-[#C9A66B] p-4 mb-6 flex items-center gap-4">
              <i className="fas fa-lock text-[#C9A66B] text-xl"></i>
              <div>
                <p className="text-sm font-semibold text-white mb-1">Secure Payment via Razorpay</p>
                <p className="text-xs text-gray-400">Pay with UPI, Cards, Net Banking, or Wallets</p>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            <button type="submit" className="w-full bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] py-4 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <i className="fas fa-lock"></i>
              Pay ₹{cartTotal.toLocaleString()}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setError(''); }}
              className="w-full mt-4 text-xs tracking-widest text-gray-500 uppercase hover:text-white transition-colors"
            >
              ← Back to Shipping
            </button>
          </div>

          {/* ── Step 3: Processing / Success ── */}
          <div className={`${step === 3 ? 'block' : 'hidden'} text-center py-12 animate-[fadeIn_0.3s_ease-out]`}>
            {loading ? (
              <>
                <div className="loader mb-8"></div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-2">Securing Transaction</h3>
                <p className="text-sm text-gray-400">Please complete payment in the Razorpay window...</p>
              </>
            ) : success ? (
              <>
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                  <i className="fas fa-check"></i>
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-widest text-white mb-2">Order Confirmed!</h2>
                <p className="text-gray-400 mb-6 text-sm">Thank you for choosing BrotherHood.</p>
                {orderId && (
                  <p className="text-xs text-gray-500 font-mono mb-8">
                    Payment ID: {orderId}
                  </p>
                )}
                <button
                  type="button"
                  className="w-full bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] py-4 hover:bg-gray-200 transition-colors"
                  onClick={handleClose}
                >
                  Back to Store
                </button>
              </>
            ) : null}
          </div>

        </form>
      </div>
    </div>
  );
}
