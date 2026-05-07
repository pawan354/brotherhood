import { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const containerRef = useRef();

  useGSAP(() => {
    // Reveal text
    gsap.from('.reveal-text', {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.3,
      ease: 'power4.out',
      delay: 0.5
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
        y: 100,
        ease: 'none'
      });
    });

    // Fade up sections
    gsap.utils.toArray('.fade-up').forEach((elem) => {
      gsap.from(elem, {
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen">
      <Navbar />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative w-full h-[70vh] overflow-hidden flex items-center justify-center">
          <img 
            src="/about_hero.png" 
            alt="BrotherHood Studio" 
            className="parallax-img absolute inset-0 w-full h-[120%] object-cover opacity-50 -mt-[10%]"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="reveal-text text-5xl md:text-7xl font-serif uppercase tracking-widest leading-tight mb-4">
              Architects of<br />Aesthetic
            </h1>
            <p className="reveal-text text-gray-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
              Where traditional craftsmanship meets the raw energy of modern streetwear.
            </p>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="fade-up py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-widest mb-8 border-l-4 border-[#C9A66B] pl-6">Our Philosophy</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Founded in the heart of the city, BrotherHood was born from a simple realization: true luxury is personal. In an era of disposable fashion, we stand for longevity, character, and the unwavering pursuit of excellence.
            </p>
            <div className="p-8 bg-zinc-900/50 border border-white/10 rounded-sm italic text-gray-300">
              "Every stitch we place is a promise of quality. We don't just build garments; we build legacies for the modern disruptor."
            </div>
          </div>
          <div className="h-[60vh] overflow-hidden rounded-sm">
            <img 
              src="/about_detail.png" 
              alt="Tailoring Details" 
              className="parallax-img w-full h-[120%] object-cover -mt-[10%]" 
            />
          </div>
        </section>

        {/* The Process Section */}
        <section className="fade-up py-24 bg-[#050505]">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center uppercase tracking-[0.3em] mb-16">The Disruptive Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {[
                { icon: 'fa-pencil-ruler', step: '01. Conceptualize', desc: 'Understanding your identity and aesthetic vision to craft a unique silhouette.' },
                { icon: 'fa-cut', step: '02. Blueprint', desc: 'Sourcing the finest heavy-weight fabrics and technical hardware from across the globe.' },
                { icon: 'fa-pen-nib', step: '03. Craft', desc: 'Expertly assembled by master tailors who respect both heritage and future.' },
                { icon: 'fa-user-check', step: '04. Perfection', desc: 'A final rigorous check to ensure every line reflects the BrotherHood standard.' },
              ].map(s => (
                <div className="text-center group hover:scale-105 transition-transform duration-500" key={s.step}>
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-zinc-900 border border-white/10 text-[#C9A66B] rounded-full group-hover:bg-[#C9A66B] group-hover:text-black transition-colors duration-500">
                    <i className={`fas ${s.icon} text-xl`}></i>
                  </div>
                  <h3 className="text-white font-bold mb-4 uppercase tracking-wider">{s.step}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Studio Section */}
        <section className="fade-up py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="h-[60vh] overflow-hidden rounded-sm order-2 md:order-1">
            <img 
              src="/about_studio.png" 
              alt="The Studio" 
              className="parallax-img w-full h-[120%] object-cover -mt-[10%]" 
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold uppercase tracking-widest mb-8">Visit the Atelier</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Experience the BrotherHood universe in person. Our private viewing studio offers an immersive look at our latest collections and bespoke possibilities.
            </p>
            <div className="space-y-4 text-gray-500">
              <p className="flex items-center gap-4 hover:text-white transition-colors">
                <i className="fas fa-map-marker-alt text-[#C9A66B]"></i> Swargate, Pune
              </p>
              <p className="flex items-center gap-4 hover:text-white transition-colors">
                <i className="fas fa-clock text-[#C9A66B]"></i> Monday — Saturday: 10am - 7pm
              </p>
            </div>
            <div className="mt-12">
              <Link to="/#shop" className="inline-block bg-white text-black font-bold text-xs uppercase tracking-widest py-4 px-10 hover:bg-gray-200 transition-colors">
                Explore the Shop
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
