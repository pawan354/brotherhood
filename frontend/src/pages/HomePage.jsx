import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef();

  useGSAP(() => {
    // Hero Animations
    gsap.from('.hero-text', {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.3,
      ease: 'power4.out',
      delay: 0.5
    });

    gsap.from('.hero-image', {
      scale: 1.2,
      duration: 2.5,
      ease: 'power2.out'
    });

    gsap.to('.hero-image', {
      scrollTrigger: {
        trigger: 'section.relative',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: 150,
      scale: 1.1,
      ease: 'none'
    });

    // Scroll Animations for sections
    gsap.utils.toArray('.fade-up').forEach((elem) => {
      gsap.from(elem, {
        scrollTrigger: {
          trigger: elem,
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Parallax Images
    gsap.utils.toArray('.parallax-img').forEach((img) => {
      gsap.to(img, {
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        y: 50, // move down slightly to create parallax effect
        ease: 'none'
      });
    });

    // Stagger Product Grid
    gsap.from('.product-card-anim', {
      scrollTrigger: {
        trigger: '#shop',
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }, { scope: containerRef });

  const filteredProducts = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative w-full h-[85vh] overflow-hidden flex items-center justify-center">
          <img 
            src="/hero_image.png" 
            alt="Hero Streetwear" 
            className="hero-image absolute inset-0 w-full h-[120%] object-cover object-[center_15%] opacity-60"
          />
          <div className="relative z-10 text-center px-4 flex flex-col items-center pt-16">
            <h1 className="hero-text text-5xl md:text-8xl font-bold uppercase tracking-widest leading-tight mb-4 drop-shadow-2xl">
              Style<br />Vibe<br />Reflect
            </h1>
            <p className="hero-text text-lg text-gray-300 mb-8 font-light max-w-lg">
              Crafting the future of urban elegance. Bespoke tailoring meets raw streetwear energy.
            </p>
            <a href="#shop" className="hero-text bg-white text-black font-semibold text-sm uppercase tracking-widest py-3 px-8 hover:bg-gray-200 transition-colors">
              Shop Now
            </a>
          </div>
        </section>

        {/* Designed to Disrupt Section */}
        <section className="fade-up py-24 px-6 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold uppercase tracking-widest mb-6">Designed to Disrupt</h2>
          <p className="text-gray-400 text-sm leading-relaxed tracking-wide uppercase">
            Luxury staples for the modern disruptor. Precision-tailored pieces that break convention and redefine presence. This isn't just fashion—it's a statement.
          </p>
        </section>

        {/* Product Grid */}
        <section id="shop" className="fade-up px-6 md:px-12 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onViewDetails={setSelectedProduct} />
            ))}
          </div>
        </section>

        {/* Marquee */}
        <div className="border-y border-white/10 py-3 bg-black overflow-hidden flex whitespace-nowrap">
          <div className="animate-marquee flex gap-12 text-xs font-semibold tracking-widest uppercase text-gray-400">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                <i className="far fa-clock"></i> LIMITED EDITION
                <span className="mx-6">|</span>
                <i className="fas fa-bolt"></i> NEW ARRIVAL
              </span>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <section className="fade-up grid grid-cols-1 md:grid-cols-2 items-center bg-black">
          <div className="p-12 md:p-24 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              To bridge the gap between high-luxury tailoring and raw streetwear. We believe in clothing as a uniform for the ambitious—built with precision, worn with intent.
            </p>
            <div>
              <Link to="/about" className="inline-block bg-white text-black font-semibold text-xs uppercase tracking-widest py-3 px-8 hover:bg-gray-200 transition-colors">
                Learn More
              </Link>
            </div>
          </div>
          <div className="h-[60vh] md:h-[80vh] overflow-hidden">
            <img src="/mission_image.png" alt="Our Mission" className="parallax-img w-full h-[120%] object-cover -mt-[10%]" />
          </div>
        </section>

        {/* Vision Section */}
        <section className="fade-up grid grid-cols-1 md:grid-cols-2 items-center bg-[#050505]">
          <div className="h-[60vh] md:h-[80vh] overflow-hidden order-2 md:order-1">
            <img src="/vision_image.png" alt="Our Vision" className="parallax-img w-full h-[120%] object-cover -mt-[10%]" />
          </div>
          <div className="p-12 md:p-24 flex flex-col justify-center order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              To redefine the modern silhouette. BrotherHood isn't just a label; it's a collective movement toward timeless design and unparalleled quality in every stitch.
            </p>
            <div>
              <Link to="/about" className="inline-block bg-white text-black font-semibold text-xs uppercase tracking-widest py-3 px-8 hover:bg-gray-200 transition-colors">
                Learn More
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Drawers & Modals */}
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8">
          <button className="absolute top-10 right-10 text-white text-3xl hover:text-gray-400" onClick={() => setSearchOpen(false)}>×</button>
          <div className="w-full max-w-3xl">
            <input
              type="text"
              className="w-full bg-transparent border-b-2 border-white/50 text-white text-3xl md:text-5xl py-4 outline-none placeholder-gray-600 focus:border-white transition-colors"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}
