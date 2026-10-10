import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { addOrder } from '@/lib/orderStore';
import type { MenuItem, CartItem, LocalOrder } from '@/lib/types';
import { CATEGORY_LABELS, type MenuCategory } from '@/lib/types';
import { formatCurrency, getTimeBasedSuggestion } from '@/lib/utils';
import { AIBarista } from '@/components/AIBarista';
import {
  Coffee,
  CupSoda,
  Croissant,
  UtensilsCrossed,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  Receipt,
  ArrowRight,
  QrCode,
} from 'lucide-react';

const ICON_MAP = { Coffee, CupSoda, Croissant, UtensilsCrossed };
const HERO_IMAGE = 'https://images.pexels.com/photos/29833130/pexels-photo-29833130.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export function CustomerMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('hot_coffee');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'placing' | 'success' | 'error'>('idle');
  const [billOrder, setBillOrder] = useState<LocalOrder | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase.from('menu_items').select('*').eq('is_available', true).order('category, name');
    if (error) {
      console.error('Error fetching menu:', error);
    } else if (data) {
      setMenuItems(data as MenuItem[]);
    }
    setLoading(false);
  };

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) => (c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    setCartOpen(true);
  }, []);

  const handleSuggestionClick = useCallback(
    (itemName: string) => {
      const item = menuItems.find((m) => m.name === itemName);
      if (item) addToCart(item);
    },
    [menuItems, addToCart]
  );

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.menuItem.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== id));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const categories: MenuCategory[] = ['hot_coffee', 'cold_coffee', 'snacks', 'combos'];
  const filteredItems = menuItems.filter((m) => m.category === activeCategory);
  const timeSuggestion = getTimeBasedSuggestion();

  const handleCheckout = () => {
    if (!customerName.trim() || !tableNumber) return;
    setOrderStatus('placing');

    const order: LocalOrder = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      customer_name: customerName.trim(),
      table_number: parseInt(tableNumber),
      status: 'new',
      total: cartTotal,
      payment_method: 'UPI',
      created_at: new Date().toISOString(),
      items: cart.map((c) => ({
        id: `${c.menuItem.id}-${c.quantity}`,
        item_name: c.menuItem.name,
        quantity: c.quantity,
        price: c.menuItem.price,
      })),
    };

    addOrder(order);
    setTimeout(() => {
      setBillOrder(order);
      setOrderStatus('success');
      setCart([]);
    }, 600);
  };

  const closeBill = () => {
    setBillOrder(null);
    setCheckoutOpen(false);
    setOrderStatus('idle');
    setCustomerName('');
    setTableNumber('');
  };

  return (
    <div className="min-h-screen bg-cafe-900">
      {/* Hero Section */}
      <header className="relative min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Cozy Pune cafe interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-cafe-900 via-cafe-900/70 to-cafe-900/30" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-2xl animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-cafe-500/20 backdrop-blur-md border border-cafe-500/30 rounded-full px-4 py-1.5 mb-5">
            <Sparkles size={14} className="text-cafe-300" />
            <span className="text-cafe-200 text-xs font-medium tracking-wide">AI-POWERED CAFE EXPERIENCE</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-cream mb-3 leading-tight">BrewMind</h1>
          <p className="text-xl sm:text-2xl text-cafe-200 font-light mb-2">Your Mood, Your Coffee</p>
          <p className="text-sm text-cafe-300 max-w-md mx-auto">Scan, order, relax. Pune's smartest cafe experience — powered by AI.</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-cafe-900/95 backdrop-blur-md border-b border-cafe-700/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee size={20} className="text-cafe-400" />
            <span className="text-cream font-semibold text-sm">BrewMind</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#/kitchen" className="text-cafe-300 hover:text-cream text-xs font-medium transition-colors">Kitchen</a>
            <a href="#/admin" className="text-cafe-300 hover:text-cream text-xs font-medium transition-colors">Admin</a>
            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-cafe-700/60 hover:bg-cafe-600/60 text-cream rounded-xl px-3 py-2 transition-all duration-200 flex items-center gap-2"
            >
              <ShoppingCart size={18} />
              <span className="text-sm font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-cafe-500 text-cafe-950 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-fade-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* AI Suggestion Banner */}
      <div className="max-w-5xl mx-auto px-4 -mt-1">
        <div className="bg-gradient-to-r from-cafe-800 to-cafe-700 border border-cafe-600/50 rounded-2xl p-4 flex items-center gap-3 my-4 animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-cafe-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-cafe-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cream text-sm font-medium truncate">{timeSuggestion.text}</p>
            <p className="text-cafe-300 text-xs">{timeSuggestion.discount} — Limited time</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-5xl mx-auto px-4 sticky top-[57px] z-20 bg-cafe-900/95 backdrop-blur-md pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat === 'hot_coffee' ? 'Coffee' : cat === 'cold_coffee' ? 'CupSoda' : cat === 'snacks' ? 'Croissant' : 'UtensilsCrossed'];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat ? 'bg-cafe-500 text-cafe-950 shadow-lg' : 'bg-cafe-800/60 text-cafe-300 hover:bg-cafe-700/60'
                }`}
              >
                <Icon size={16} />
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      <main className="max-w-5xl mx-auto px-4 py-4 pb-32">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="cafe-card h-48 shimmer-bg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item, i) => (
              <div key={item.id} className="cafe-card overflow-hidden group animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="text-cream font-semibold text-sm sm:text-base leading-snug">{item.name}</h3>
                      <p className="text-cafe-300 text-xs mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-cafe-400 font-bold text-base">{formatCurrency(item.price)}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="flex items-center gap-1 bg-cafe-500 hover:bg-cafe-400 text-cafe-950 text-xs font-semibold rounded-lg px-3 py-1.5 transition-all duration-200 active:scale-90"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={() => setCartOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-cafe-900 z-50 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-cafe-700">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-cafe-400" />
                <h2 className="text-cream font-semibold text-lg">Your Cart</h2>
                {cartCount > 0 && <span className="text-cafe-300 text-sm">({cartCount})</span>}
              </div>
              <button onClick={() => setCartOpen(false)} className="text-cafe-300 hover:text-cream p-1.5 rounded-lg hover:bg-cafe-800">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-cafe-800 flex items-center justify-center mb-3">
                    <ShoppingCart size={28} className="text-cafe-600" />
                  </div>
                  <p className="text-cafe-300 text-sm">Your cart is empty</p>
                  <p className="text-cafe-400 text-xs mt-1">Add some coffee to get started!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.menuItem.id} className="bg-cafe-800/60 rounded-xl p-3 flex items-center gap-3 animate-fade-in">
                    <img src={item.menuItem.image_url} alt={item.menuItem.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-sm font-medium truncate">{item.menuItem.name}</p>
                      <p className="text-cafe-400 text-xs">{formatCurrency(item.menuItem.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.menuItem.id, -1)} className="w-7 h-7 rounded-lg bg-cafe-700 hover:bg-cafe-600 text-cream flex items-center justify-center transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="text-cream text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItem.id, 1)} className="w-7 h-7 rounded-lg bg-cafe-700 hover:bg-cafe-600 text-cream flex items-center justify-center transition-colors">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => removeFromCart(item.menuItem.id)} className="w-7 h-7 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center transition-colors ml-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-cafe-700 px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cafe-300 text-sm">Total</span>
                  <span className="text-cream font-bold text-xl">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="w-full bg-cafe-500 hover:bg-cafe-400 text-cafe-950 font-semibold rounded-xl py-3.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50 animate-fade-in" onClick={() => orderStatus === 'idle' && setCheckoutOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-cafe-900 rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-slide-up max-h-[90vh] overflow-y-auto">
              {orderStatus === 'success' && billOrder ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4 animate-bounce-subtle">
                    <CheckCircle2 size={36} className="text-green-400" />
                  </div>
                  <h2 className="text-cream font-bold text-xl mb-1">Order Placed!</h2>
                  <p className="text-cafe-300 text-sm mb-5">Your coffee is being prepared.</p>

                  <div className="bg-cafe-800/60 rounded-xl p-5 text-left space-y-3 mb-5 border border-cafe-700/50">
                    <div className="flex items-center justify-between border-b border-cafe-700/50 pb-3">
                      <span className="text-cafe-300 text-xs">Bill No.</span>
                      <span className="text-cream text-sm font-mono">#{billOrder.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cafe-300 text-xs">Customer</span>
                      <span className="text-cream text-sm">{billOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cafe-300 text-xs">Table</span>
                      <span className="text-cream text-sm">No. {billOrder.table_number}</span>
                    </div>
                    <div className="border-t border-cafe-700/50 pt-3 space-y-1.5">
                      {billOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-cafe-200">{item.item_name} x{item.quantity}</span>
                          <span className="text-cafe-300">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-cafe-700/50 pt-3">
                      <span className="text-cream font-semibold text-sm">Total (UPI Paid)</span>
                      <span className="text-cafe-400 font-bold text-lg">{formatCurrency(billOrder.total)}</span>
                    </div>
                  </div>

                  {/* Mock UPI QR */}
                  <div className="bg-white rounded-2xl p-4 mx-auto w-40 h-40 mb-4 flex flex-col items-center justify-center">
                    <QrCode size={100} className="text-cafe-900" strokeWidth={1.5} />
                    <p className="text-cafe-900 text-[10px] font-bold mt-1">brewmind@upi</p>
                  </div>
                  <p className="text-cafe-300 text-xs mb-5 flex items-center justify-center gap-1.5">
                    <Receipt size={14} />
                    Show bill #{billOrder.id} at the counter
                  </p>

                  <button onClick={closeBill} className="w-full bg-cafe-500 hover:bg-cafe-400 text-cafe-950 font-semibold rounded-xl py-3 transition-all duration-200 active:scale-95">
                    Done
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-cream font-bold text-lg">Checkout</h2>
                    <button onClick={() => setCheckoutOpen(false)} className="text-cafe-300 hover:text-cream p-1.5 rounded-lg hover:bg-cafe-800">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-cafe-800/60 rounded-xl p-4 mb-5 space-y-2 max-h-40 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.menuItem.id} className="flex items-center justify-between text-sm">
                        <span className="text-cafe-200">{item.menuItem.name} x{item.quantity}</span>
                        <span className="text-cafe-300">{formatCurrency(item.menuItem.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-cafe-700/50 pt-2 mt-2">
                      <span className="text-cream font-semibold">Total</span>
                      <span className="text-cafe-400 font-bold">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-cafe-300 text-xs font-medium mb-1.5 block">Your Name</label>
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-cafe-800/60 text-cream text-sm rounded-xl px-4 py-3 placeholder-cafe-500 focus:outline-none focus:ring-2 focus:ring-cafe-500/50 border border-cafe-700/50"
                      />
                    </div>
                    <div>
                      <label className="text-cafe-300 text-xs font-medium mb-1.5 block">Table Number (1–20)</label>
                      <select
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full bg-cafe-800/60 text-cream text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cafe-500/50 border border-cafe-700/50"
                      >
                        <option value="">Select table...</option>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>Table {n}</option>
                        ))}
                      </select>
                    </div>

                    {/* Mock UPI QR */}
                    <div className="bg-cafe-800/60 rounded-xl p-4 border border-cafe-700/50 flex items-center gap-4">
                      <div className="bg-white rounded-xl p-2 w-20 h-20 flex items-center justify-center flex-shrink-0">
                        <QrCode size={56} className="text-cafe-900" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="text-cream text-sm font-medium">Pay via UPI</p>
                        <p className="text-cafe-400 text-xs">brewmind@upi</p>
                        <p className="text-cafe-300 text-sm font-bold mt-1">{formatCurrency(cartTotal)}</p>
                      </div>
                      <CheckCircle2 size={18} className="text-green-400" />
                    </div>

                    {orderStatus === 'error' && (
                      <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={!customerName.trim() || !tableNumber || orderStatus === 'placing'}
                      className="w-full bg-cafe-500 hover:bg-cafe-400 disabled:bg-cafe-700 disabled:text-cafe-500 text-cafe-950 font-semibold rounded-xl py-3.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {orderStatus === 'placing' ? (
                        <>Placing Order...</>
                      ) : (
                        <>Pay {formatCurrency(cartTotal)} & Place Order</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* AI Barista */}
      <AIBarista menuItems={menuItems} onSuggestionClick={handleSuggestionClick} />
    </div>
  );
}
