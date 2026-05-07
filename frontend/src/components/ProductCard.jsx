import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onViewDetails }) {
  const { addToCart } = useCart();
  
  // Fake original price for the aesthetic (+20%)
  const originalPrice = Math.round(product.price * 1.2);

  return (
    <div
      className="group cursor-pointer flex flex-col product-card-anim"
      onClick={() => onViewDetails(product)}
    >
      <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-zinc-900">
        <img 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
        />
        {/* Sale Badge */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest px-3 py-1 border border-white/20">
          Sale
        </div>
      </div>
      <div className="flex flex-col flex-grow justify-between">
        <h3 className="text-sm font-semibold tracking-wider text-gray-200 mb-1">{product.name}</h3>
        <div className="flex gap-3 text-xs tracking-widest font-mono mt-1">
          <span className="text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
          <span className="text-white">₹{product.price.toLocaleString()}</span>
        </div>
        <button
          className="mt-4 bg-transparent border border-white/20 text-white font-medium text-[10px] uppercase tracking-[0.2em] py-2 w-full hover:bg-white hover:text-black transition-colors"
          onClick={e => { e.stopPropagation(); addToCart(product.id, 'M'); }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
