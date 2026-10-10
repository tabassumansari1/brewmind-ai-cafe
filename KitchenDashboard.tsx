import { useState, useEffect, useRef, useCallback } from 'react';
import { getActiveOrders, updateOrderStatus } from '@/lib/orderStore';
import type { LocalOrder, OrderStatus } from '@/lib/types';
import { formatCurrency, formatTime } from '@/lib/utils';
import {
  ChefHat,
  Clock,
  Bell,
  CheckCircle2,
  Flame,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Coffee,
} from 'lucide-react';

export function KitchenDashboard() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const lastOrderIds = useRef<Set<string>>(new Set());
  const audioContext = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContext.current;
      const now = ctx.currentTime;

      for (let i = 0; i < 2; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        const startTime = now + i * 0.25;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.linearRampToValueAtTime(0, startTime + 0.15);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      }
    } catch {
      // Audio not available
    }
  }, [soundEnabled]);

  const fetchOrders = useCallback(() => {
    const activeOrders = getActiveOrders();
    const currentIds = new Set(activeOrders.map((o) => o.id));
    const freshNewOrders = activeOrders.filter((o) => o.status === 'new' && !lastOrderIds.current.has(o.id));

    if (freshNewOrders.length > 0 && lastOrderIds.current.size > 0) {
      playBeep();
    }

    lastOrderIds.current = currentIds;
    setOrders(activeOrders);
    setNewOrderCount(activeOrders.filter((o) => o.status === 'new').length);
    setLoading(false);
  }, [playBeep]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);

    const onStorage = () => fetchOrders();
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchOrders]);

  const handleAdvance = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus: OrderStatus = currentStatus === 'new' ? 'preparing' : currentStatus === 'preparing' ? 'ready' : 'completed';
    updateOrderStatus(orderId, nextStatus);
    fetchOrders();
  };

  const columns: { status: OrderStatus; title: string; icon: typeof Clock; color: string }[] = [
    { status: 'new', title: 'New Orders', icon: Bell, color: 'text-blue-400' },
    { status: 'preparing', title: 'Preparing', icon: Flame, color: 'text-orange-400' },
    { status: 'ready', title: 'Ready', icon: CheckCircle2, color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-cafe-900">
      <header className="sticky top-0 z-30 bg-cafe-900/95 backdrop-blur-md border-b border-cafe-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="#/" className="text-cafe-300 hover:text-cream transition-colors">
              <ArrowLeft size={20} />
            </a>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cafe-500/20 flex items-center justify-center">
                <ChefHat size={20} className="text-cafe-400" />
              </div>
              <div>
                <h1 className="text-cream font-bold text-base">Kitchen Dashboard</h1>
                <p className="text-cafe-400 text-xs">Live order tracking</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {newOrderCount > 0 && (
              <div className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1.5 animate-fade-in">
                <Bell size={14} className="text-blue-400 animate-bounce" />
                <span className="text-blue-300 text-xs font-semibold">{newOrderCount} new</span>
              </div>
            )}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-cafe-800/60 hover:bg-cafe-700/60 text-cream rounded-xl p-2.5 transition-all duration-200"
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 shimmer-bg rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => {
              const colOrders = orders.filter((o) => o.status === col.status);
              const Icon = col.icon;
              return (
                <div key={col.status} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Icon size={18} className={col.color} />
                    <h2 className="text-cream font-semibold text-sm">{col.title}</h2>
                    <span className="text-cafe-400 text-xs bg-cafe-800/60 rounded-full px-2 py-0.5">{colOrders.length}</span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {colOrders.length === 0 ? (
                      <div className="cafe-card p-8 text-center">
                        <Coffee size={24} className="text-cafe-700 mx-auto mb-2" />
                        <p className="text-cafe-500 text-sm">No orders</p>
                      </div>
                    ) : (
                      colOrders.map((order, i) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onAdvance={() => handleAdvance(order.id, col.status)}
                          advanceLabel={col.status === 'new' ? 'Start Preparing' : col.status === 'preparing' ? 'Mark Ready' : 'Complete Order'}
                          advanceIcon={col.status === 'ready' ? CheckCircle2 : ArrowRight}
                          index={i}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function OrderCard({
  order,
  onAdvance,
  advanceLabel,
  advanceIcon: AdvanceIcon,
  index,
}: {
  order: LocalOrder;
  onAdvance: () => void;
  advanceLabel: string;
  advanceIcon: typeof ArrowRight;
  index: number;
}) {
  const [currentElapsed, setCurrentElapsed] = useState(() =>
    Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentElapsed(Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const isUrgent = currentElapsed > 300;

  return (
    <div className="cafe-card p-4 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-cream font-semibold text-sm">Table {order.table_number}</p>
          <p className="text-cafe-400 text-xs">{order.customer_name} · #{order.id}</p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-lg ${
          isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-cafe-700/50 text-cafe-300'
        }`}>
          <Clock size={12} />
          {formatTime(currentElapsed)}
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm bg-cafe-800/40 rounded-lg px-2.5 py-1.5">
            <span className="text-cafe-200">{item.item_name}</span>
            <span className="text-cafe-400 font-medium">x{item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-cafe-700/50">
        <span className="text-cafe-300 text-xs">{formatCurrency(order.total)}</span>
        <button
          onClick={onAdvance}
          className="flex items-center gap-1.5 bg-cafe-500 hover:bg-cafe-400 text-cafe-950 text-xs font-semibold rounded-lg px-3 py-2 transition-all duration-200 active:scale-90"
        >
          {advanceLabel}
          <AdvanceIcon size={14} />
        </button>
      </div>
    </div>
  );
}
