import { useCart } from '../context/CartContext';

export default function CartDrawer({ onCheckout }) {
  const { cartItems, cartTotal, isOpen, setIsOpen, updateQty, removeFromCart } = useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-300" 
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#050505] border-l border-white/10 z-[210] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-white m-0">Shopping Bag</h3>
          <button className="text-gray-400 hover:text-white text-2xl" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 text-sm tracking-widest uppercase mt-10">Your bag is empty.</p>
          ) : (
            cartItems.map(({ cartItemId, product, size, quantity }) => (
              <div className="flex gap-4" key={cartItemId}>
                <div className="w-24 h-32 bg-zinc-900 shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium text-white">{product.name}</h4>
                    <button
                      onClick={() => removeFromCart(cartItemId)}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Size: {size}</p>
                  <p className="text-[#C9A66B] font-mono tracking-widest text-sm mb-auto">₹{product.price.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center border border-white/20">
                      <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10" onClick={() => updateQty(cartItemId, 'decrease')}>−</button>
                      <span className="w-8 text-center text-sm font-mono">{quantity}</span>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10" onClick={() => updateQty(cartItemId, 'increase')}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-black">
          <div className="flex justify-between items-center mb-6 text-sm font-bold uppercase tracking-widest text-white">
            <span>Total</span>
            <span className="text-[#C9A66B] font-mono text-lg">₹{cartTotal.toLocaleString()}</span>
          </div>
          <button
            className="w-full bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] py-4 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => { setIsOpen(false); onCheckout(); }}
            disabled={cartItems.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}
