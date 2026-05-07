import { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function CatalogPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const containerRef = useRef();
  const categories = ['All', ...new Set(products.map(p => p.category))];

  useGSAP(() => {
    // Header reveal
    gsap.from('.header-reveal', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.2
    });

    // Stagger product cards
    gsap.from('.product-card-anim', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.catalog-grid',
        start: 'top 85%',
      }
    });
  }, { scope: containerRef });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen flex flex-col">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />

      <main className="pt-32 flex-grow">
        {/* Header Section */}
        <section className="px-6 md:px-12 mb-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="header-reveal">
              <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-widest mb-4">Catalog</h1>
              <p className="text-gray-500 text-sm md:text-base max-w-md tracking-wide">
                Browse our curated collection of high-performance luxury staples.
              </p>
            </div>
            
            {/* Filter Pills */}
            <div className="header-reveal flex flex-wrap gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 text-[10px] uppercase tracking-widest font-bold border rounded-full transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-white text-black border-white' 
                      : 'border-white/10 text-gray-500 hover:border-white/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Info */}
        <div className="px-6 md:px-12 max-w-7xl mx-auto mb-8 text-[10px] uppercase tracking-widest text-gray-600 flex justify-between items-center border-b border-white/5 pb-4">
          <span>Showing {filteredProducts.length} Results</span>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="hover:text-white transition-colors">
              Clear Search: "{searchQuery}" ×
            </button>
          )}
        </div>

        {/* Product Grid */}
        <section className="catalog-grid px-6 md:px-12 max-w-7xl mx-auto pb-24">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onViewDetails={setSelectedProduct} 
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-gray-500 uppercase tracking-[0.3em] text-sm">No products found matching your criteria.</p>
              <button 
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-8 text-white border-b border-white pb-1 text-xs uppercase tracking-widest hover:text-gray-400 hover:border-gray-400 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Drawers & Modals */}
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex flex-col items-center justify-center p-8 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]">
          <button className="absolute top-10 right-10 text-white text-3xl hover:text-gray-400 transition-colors" onClick={() => setSearchOpen(false)}>×</button>
          <div className="w-full max-w-3xl">
            <input
              type="text"
              className="w-full bg-transparent border-b border-white/20 text-white text-3xl md:text-6xl py-4 outline-none placeholder-gray-800 focus:border-white transition-all duration-500"
              placeholder="Start typing..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            <p className="mt-4 text-[10px] uppercase tracking-widest text-gray-600">Press Esc to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
