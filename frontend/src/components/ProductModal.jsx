import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [size, setSize] = useState('M');

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-[fadeIn_0.3s_ease-out]" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl leading-none z-10" 
          onClick={onClose}
        >
          &times;
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-zinc-900">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white mb-2">{product.name}</h2>
            <div className="flex gap-4 items-end mb-8 font-mono tracking-widest">
              <span className="text-gray-500 line-through text-sm">₹{Math.round(product.price * 1.2).toLocaleString()}</span>
              <span className="text-[#C9A66B] text-xl">₹{product.price.toLocaleString()}</span>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {product.description}
            </p>
            
            <div className="mb-8">
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Select Size</label>
              <div className="grid grid-cols-4 gap-2">
                {['S', 'M', 'L', 'XL'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setSize(s)}
                    className={`border py-3 text-xs font-mono tracking-widest transition-colors ${
                      size === s ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:border-white/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              className="w-full bg-white text-black font-semibold text-xs uppercase tracking-widest py-4 hover:bg-gray-200 transition-colors"
              onClick={() => { addToCart(product.id, size); onClose(); }}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
