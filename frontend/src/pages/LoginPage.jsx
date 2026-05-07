import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null); // { msg, type }
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) { navigate('/'); return null; }

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { showToast('Please enter both email and password.', 'error'); return; }
    setLoading(true);
    try {
      const msg = await login(email, password);
      showToast('✓ ' + msg);
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      showToast(err.message, 'error');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!email || !password) { showToast('Please enter email and password.', 'error'); return; }
    const name = prompt('Enter your full name:');
    if (!name?.trim()) { showToast('Name is required.', 'error'); return; }
    setLoading(true);
    try {
      const msg = await register(name.trim(), email, password);
      showToast('✓ ' + msg);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      showToast(err.message, 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col p-8 md:p-12 relative animate-[fadeIn_0.5s_ease-out]">
      
      {/* Top Left Logo */}
      <Link to="/" className="font-serif text-2xl md:text-3xl tracking-[0.3em] uppercase hover:text-gray-300 transition-colors w-fit">
        BROTHERHOOD
      </Link>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-lg mt-12 md:mt-0 mx-auto">
        <h1 className="font-serif text-3xl mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-sm mb-12">Sign in to access your bespoke collections</p>

        <form onSubmit={handleLogin} className="space-y-6 w-full">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
              className="w-full bg-[#111111] text-white p-4 outline-none placeholder-gray-600 focus:bg-[#1a1a1a] transition-colors border-none"
            />
          </div>
          
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#111111] text-white p-4 outline-none placeholder-gray-600 focus:bg-[#1a1a1a] transition-colors border-none"
            />
          </div>

          {/* Toast */}
          {toast && (
            <div className={`p-4 text-sm font-medium ${toast.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
              {toast.msg}
            </div>
          )}

          <div className="pt-8 space-y-6 flex flex-col items-center">
            <button 
              type="submit" 
              disabled={loading} 
              className="text-white text-sm font-bold uppercase tracking-[0.2em] hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
            
            <button 
              type="button" 
              onClick={handleRegister} 
              disabled={loading} 
              className="text-white text-sm font-bold uppercase tracking-[0.2em] hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center my-10 opacity-30 w-full max-w-[300px] mx-auto">
          <div className="flex-1 h-px bg-white"></div>
          <span className="px-4 text-[10px] tracking-widest uppercase">OR</span>
          <div className="flex-1 h-px bg-white"></div>
        </div>

        <button 
          onClick={() => showToast('Google login requires additional configuration. Use email/password instead.', 'error')}
          className="w-full max-w-[300px] mx-auto bg-[#111111] hover:bg-[#1a1a1a] transition-colors text-white p-4 flex items-center justify-center gap-3 text-sm border-none"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="Google" />
          Continue with Google
        </button>
      </div>

      {/* Bottom Left Link */}
      <Link to="/" className="absolute bottom-8 left-8 text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-2">
        <i className="fas fa-arrow-left"></i> Back to Store
      </Link>
    </div>
  );
}
