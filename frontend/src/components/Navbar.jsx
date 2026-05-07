import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onSearchOpen }) {
  const { isLoggedIn } = useAuth();
  const { cartCount, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="fixed w-full top-0 z-50">
      {/* Top Announcement Bar */}
      <div className="bg-[#050505] text-[10px] tracking-[0.2em] text-center py-2 uppercase text-gray-400">
        LIMITED RELEASES. EXCLUSIVE DROPS. ELEGANCE IS NOW LIVE.
      </div>
      
      {/* Main Navbar */}
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10 py-4 px-6 md:px-12 grid grid-cols-2 md:grid-cols-3 items-center">
        
        {/* Desktop Links (Left) */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8 text-xs font-medium tracking-wider uppercase text-gray-400">
            <li><Link to="/" className={`${location.pathname === '/' ? 'text-white' : 'hover:text-white transition-colors'}`}>Home</Link></li>
            <li><Link to="/catalog" className={`${location.pathname === '/catalog' ? 'text-white' : 'hover:text-white transition-colors'}`}>Catalog</Link></li>
            <li><Link to="/about" className={`${location.pathname === '/about' ? 'text-white' : 'hover:text-white transition-colors'}`}>About</Link></li>
          </ul>
        </nav>

        {/* Logo (Center) */}
        <div className="flex justify-start md:justify-center">
          <Link to="/">
            {/* We apply brightness-0 invert to make the dark logo pure white */}
            <img src="/brotherhood_logo.png" alt="BROTHERHOOD" className="h-6 md:h-8 object-contain" />
          </Link>
        </div>

        {/* Actions (Right) */}
        <div className="flex justify-end items-center space-x-6 text-gray-400">
          <button onClick={onSearchOpen} className="hover:text-white transition-colors">
            <i className="fas fa-search text-sm"></i>
          </button>
          
          <Link to={isLoggedIn ? '/profile' : '/login'} className={`hover:text-white transition-colors ${isLoggedIn ? 'text-[#C9A66B]' : ''}`}>
            <i className="far fa-user text-sm"></i>
          </Link>
          
          <button onClick={() => setIsOpen(true)} className="relative hover:text-white transition-colors">
            <i className="fas fa-shopping-bag text-sm"></i>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-white text-black text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-black border-b border-white/10 px-6 py-4 absolute w-full top-full">
          <ul className="flex flex-col space-y-4 text-sm font-medium tracking-wider uppercase text-gray-400">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li><Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
}
