import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (token) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/mine`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) { const data = await res.json(); setOrders(data.orders || []); setLoading(false); return; }
        } catch {}
      }
      // Fallback: localStorage
      const local = JSON.parse(localStorage.getItem('bh_orders') || '[]');
      setOrders(local);
      setLoading(false);
    }
    fetchOrders();
  }, [token]);

  return (
    <div className="orders-page">
      <header style={{ padding: '40px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-accent-gold)', textDecoration: 'none', letterSpacing: '5px' }}>BROTHERHOOD</Link>
        <Link to="/" style={{ color: 'var(--color-white)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <i className="fas fa-arrow-left"></i> Back to Store
        </Link>
      </header>

      <main style={{ padding: '80px 0', flex: 1 }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-white)', marginBottom: '40px', textAlign: 'center', fontSize: '2.5rem' }}>
            Your Orders
          </h1>

          {loading ? (
            <p style={{ textAlign: 'center', opacity: 0.5 }}>Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
              <i className="fas fa-box-open" style={{ fontSize: '3rem', marginBottom: '20px', display: 'block' }}></i>
              <p>You haven't placed any orders yet.</p>
              <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '40px' }}>Start Shopping</Link>
            </div>
          ) : (
            <div id="orders-list">
              {orders.map((order, i) => (
                <div className="order-card" key={order._id || order.id || i}>
                  <div className="order-icon"><i className="fas fa-shopping-bag"></i></div>
                  <div>
                    <h3 style={{ color: 'var(--color-white)', marginBottom: '4px' }}>
                      Order #{order._id ? order._id.toString().slice(-6).toUpperCase() : order.id}
                    </h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                      Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}
                    </p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                      {Array.isArray(order.items) ? order.items.length : order.items} item(s)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="status-badge">{order.status || 'Paid'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-white)', display: 'block' }}>
                      ₹{(order.totalAmount || order.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '80px', textAlign: 'center', background: 'rgba(201,166,107,0.05)', padding: '40px', borderRadius: '4px' }}>
            <p><i className="fas fa-shipping-fast" style={{ color: 'var(--color-accent-gold)' }}></i> All active orders are being prepared by our master tailors and will reach you soon.</p>
          </div>
        </div>
      </main>

      <footer style={{ padding: '40px 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', opacity: 0.6 }}>
        <div className="container"><p>© 2026 BrotherHood. Handcrafted Excellence.</p></div>
      </footer>
    </div>
  );
}
