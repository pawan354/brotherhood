import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, token, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }

    async function fetchOrders() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/mine`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const data = await res.json(); setOrders(data.orders || []); }
      } catch {}
      setLoadingOrders(false);
    }
    fetchOrders();
  }, [isLoggedIn, token, navigate]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return null;

  const initial = (user.name || user.email || 'B')[0].toUpperCase();

  return (
    <div className="profile-page">
      <div className="container">
        <header style={{ padding: '30px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/">
            <img src="/brotherhood_logo.png" alt="BROTHERHOOD" style={{ height: '50px', width: '200px', objectFit: 'contain', filter: 'brightness(1.2)' }} />
          </Link>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/" style={{ textDecoration: 'none', border: '1px solid var(--color-accent-gold)', color: 'var(--color-accent-gold)', padding: '10px 25px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
              <i className="fas fa-shopping-bag" style={{ marginRight: '8px' }}></i>Continue Shopping
            </Link>
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--color-text-main)', padding: '10px 25px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', transition: '0.3s' }}>
              Logout
            </button>
          </div>
        </header>

        {/* Hero */}
        <section style={{ padding: '100px 0 60px', textAlign: 'center', background: 'linear-gradient(to bottom, rgba(201,166,107,0.05), transparent)' }}>
          <div className="profile-avatar">{initial}</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '5px', color: 'var(--color-white)' }}>
            {user.name || 'Valued Member'}
          </h1>
          <p style={{ opacity: 0.6, fontSize: '1rem', letterSpacing: '1px' }}>{user.email}</p>
        </section>

        {/* Grid */}
        <main className="profile-grid">
          <aside>
            <div className="profile-section">
              <h3 className="section-title">Account Details</h3>
              <div className="info-card">
                {[
                  { label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'May 2026' },
                  { label: 'Preferred Style', value: 'Bespoke Tailoring' },
                  { label: 'Location', value: 'Pune, India' },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px' }}>{item.label}</span>
                    <span style={{ fontSize: '1rem', color: 'var(--color-white)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="profile-section">
              <h3 className="section-title">Recent Orders</h3>
              <div>
                {loadingOrders ? (
                  <p style={{ opacity: 0.5 }}>Fetching your recent bespoke orders...</p>
                ) : orders.length === 0 ? (
                  <p style={{ opacity: 0.5 }}>No orders found yet. Time to start your bespoke journey.</p>
                ) : (
                  orders.map(order => (
                    <div className="order-row" key={order._id}>
                      <div>
                        <span style={{ fontWeight: 500, color: 'var(--color-white)' }}>
                          Order #{order._id.toString().slice(-6).toUpperCase()}
                        </span>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                          {new Date(order.createdAt).toLocaleDateString()} • {Array.isArray(order.items) ? order.items.length : 0} Items
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-white)', marginBottom: '4px' }}>₹{order.totalAmount.toLocaleString()}</div>
                        <span className="order-status-badge">{order.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="profile-section">
              <h3 className="section-title">Saved Addresses</h3>
              <div className="info-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', padding: '60px' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>
                  <i className="fas fa-plus" style={{ marginRight: '10px' }}></i>Add a new shipping address
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
