import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getOrders } from '@/lib/orderStore';
import type { LocalOrder, InventoryItem, LoyaltyCustomer } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Crown,
  Package,
  AlertTriangle,
  ArrowLeft,
  Coffee,
  Trophy,
  Zap,
  Download,
  UtensilsCrossed,
  Award,
  Phone,
} from 'lucide-react';

const HOURLY_FALLBACK = [
  { hour: '8 AM', sales: 320 },
  { hour: '9 AM', sales: 890 },
  { hour: '10 AM', sales: 1240 },
  { hour: '11 AM', sales: 680 },
  { hour: '12 PM', sales: 950 },
  { hour: '1 PM', sales: 720 },
  { hour: '2 PM', sales: 410 },
  { hour: '3 PM', sales: 280 },
  { hour: '4 PM', sales: 520 },
  { hour: '5 PM', sales: 690 },
  { hour: '6 PM', sales: 830 },
  { hour: '7 PM', sales: 450 },
];

export function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyCustomer[]>([]);

  const allOrders = useMemo(() => getOrders(), [loading]);

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  const fetchSupabaseData = async () => {
    const { data: invData } = await supabase.from('inventory').select('*');
    if (invData) setInventory(invData as InventoryItem[]);

    const { data: loyaltyData } = await supabase
      .from('loyalty_customers')
      .select('*')
      .order('visits', { ascending: false })
      .limit(10);
    if (loyaltyData) setLoyalty(loyaltyData as LoyaltyCustomer[]);

    setLoading(false);
  };

  // Compute stats from localStorage orders + fallback demo data
  const stats = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter((o) => new Date(o.created_at) >= startOfToday);
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = allOrders.length;
    const activeTables = new Set(todayOrders.filter((o) => o.status !== 'completed').map((o) => o.table_number)).size;

    // Item counts
    const itemCounts: Record<string, number> = {};
    todayOrders.forEach((o) => o.items.forEach((item) => {
      itemCounts[item.item_name] = (itemCounts[item.item_name] || 0) + item.quantity;
    }));
    const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    const topItemName = sortedItems.length > 0 ? sortedItems[0][0] : 'Classic Cappuccino';

    // Use fallback if no real orders today
    const hasRealOrders = todayOrders.length > 0;
    const salesValue = hasRealOrders ? todaySales : 5240;
    const ordersValue = hasRealOrders ? totalOrdersCount : 47;
    const tablesValue = hasRealOrders ? activeTables : 5;

    // Hourly data
    let hourly: { hour: string; sales: number }[];
    if (hasRealOrders) {
      const hours = Array(12).fill(0);
      todayOrders.forEach((o) => {
        const hour = new Date(o.created_at).getHours();
        const idx = hour - 8;
        if (idx >= 0 && idx < 12) hours[idx] += o.total;
      });
      hourly = HOURLY_FALLBACK.map((h, i) => ({ hour: h.hour, sales: hours[i] }));
    } else {
      hourly = HOURLY_FALLBACK;
    }

    return { salesValue, ordersValue, tablesValue, topItemName, hourly };
  }, [allOrders]);

  const lowStockItems = inventory.filter((i) => i.quantity <= i.threshold);

  const loyaltyWithPoints = loyalty.map((c) => ({
    ...c,
    points: c.visits * 50 + Math.floor(Number(c.total_spent) / 10),
    status: c.visits >= 15 ? 'Gold' : c.visits >= 10 ? 'Silver' : 'Bronze',
  }));

  const handleDownloadReport = () => {
    const reportData = {
      date: new Date().toISOString().split('T')[0],
      todaySales: stats.salesValue,
      totalOrders: stats.ordersValue,
      activeTables: stats.tablesValue,
      topItem: stats.topItemName,
      hourlySales: stats.hourly,
      lowStock: lowStockItems.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit })),
      loyaltyCustomers: loyaltyWithPoints.map((c) => ({ name: c.name, points: c.points, status: c.status, visits: c.visits })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brewmind-report-${reportData.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cafe-900 flex items-center justify-center">
        <Coffee size={32} className="text-cafe-600 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cafe-900">
      <header className="sticky top-0 z-30 bg-cafe-900/95 backdrop-blur-md border-b border-cafe-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="#/" className="text-cafe-300 hover:text-cream transition-colors">
              <ArrowLeft size={20} />
            </a>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cafe-500/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-cafe-400" />
              </div>
              <div>
                <h1 className="text-cream font-bold text-base">Owner Dashboard</h1>
                <p className="text-cafe-400 text-xs">BrewMind AI Cafe — Analytics</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-cafe-500 hover:bg-cafe-400 text-cafe-950 text-xs font-semibold rounded-xl px-3 py-2 transition-all duration-200 active:scale-90"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download Report</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp} label="Today's Sales" value={formatCurrency(stats.salesValue)} color="text-green-400" bg="bg-green-500/10" index={0} />
          <StatCard icon={ShoppingBag} label="Total Orders" value={stats.ordersValue.toString()} color="text-blue-400" bg="bg-blue-500/10" index={1} />
          <StatCard icon={UtensilsCrossed} label="Active Tables" value={stats.tablesValue.toString()} color="text-orange-400" bg="bg-orange-500/10" index={2} />
          <StatCard icon={Crown} label="Top Item" value={stats.topItemName} color="text-cafe-400" bg="bg-cafe-500/10" index={3} />
        </div>

        {/* Sales Chart */}
        <div className="cafe-card p-5 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-cafe-400" />
            <h2 className="text-cream font-semibold text-sm">Hourly Sales (8 AM — 7 PM)</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.hourly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5A3820" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#A67854', fontSize: 10 }} axisLine={{ stroke: '#5A3820' }} tickLine={false} />
              <YAxis tick={{ fill: '#A67854', fontSize: 10 }} axisLine={{ stroke: '#5A3820' }} tickLine={false} tickFormatter={(v) => `Rs.${v}`} />
              <Tooltip
                cursor={{ fill: '#3C241540' }}
                contentStyle={{ background: '#3C2415', border: '1px solid #6B4423', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#FFF8E1' }}
                formatter={(value) => [`Rs. ${value}`, 'Sales']}
              />
              <Bar dataKey="sales" fill="#C49A6C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="cafe-card p-5 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-lg ${lowStockItems.length > 0 ? 'bg-red-500/15' : 'bg-cafe-800/60'} flex items-center justify-center`}>
                <AlertTriangle size={16} className={lowStockItems.length > 0 ? 'text-red-400' : 'text-cafe-500'} />
              </div>
              <h2 className="text-cream font-semibold text-sm">Low Stock Alert</h2>
              {lowStockItems.length > 0 && (
                <span className="bg-red-500/20 text-red-400 text-[10px] font-semibold rounded-full px-2 py-0.5">{lowStockItems.length}</span>
              )}
            </div>
            <div className="space-y-2.5">
              {inventory.length === 0 ? (
                <p className="text-cafe-500 text-sm text-center py-4">No inventory data</p>
              ) : (
                inventory.map((item) => {
                  const isLow = item.quantity <= item.threshold;
                  return (
                    <div key={item.id} className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border transition-all ${isLow ? 'bg-red-500/10 border-red-500/20' : 'bg-cafe-800/40 border-cafe-700/30'}`}>
                      <div className="flex items-center gap-2.5">
                        <Package size={16} className={isLow ? 'text-red-400' : 'text-cafe-500'} />
                        <span className="text-cream text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isLow ? 'text-red-400' : 'text-cafe-300'}`}>{item.quantity} {item.unit} left</span>
                        {isLow && (
                          <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-[10px] font-semibold rounded-full px-2 py-0.5">
                            <Zap size={10} />Low
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Loyalty Customers Table */}
          <div className="cafe-card p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cafe-500/15 flex items-center justify-center">
                <Award size={16} className="text-cafe-400" />
              </div>
              <h2 className="text-cream font-semibold text-sm">Loyalty Customers</h2>
            </div>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-cafe-400 text-xs border-b border-cafe-700/50">
                    <th className="text-left py-2 px-2 font-medium">Name</th>
                    <th className="text-right py-2 px-2 font-medium">Points</th>
                    <th className="text-center py-2 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyWithPoints.length === 0 ? (
                    <tr><td colSpan={3} className="text-cafe-500 text-sm text-center py-6">No customers yet</td></tr>
                  ) : (
                    loyaltyWithPoints.map((c, i) => (
                      <tr key={c.id} className="border-b border-cafe-700/30 hover:bg-cafe-800/30 transition-colors">
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cafe-700/60 text-cafe-300'}`}>
                              {i === 0 ? <Trophy size={12} /> : i + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-cream text-xs font-medium truncate">{c.name}</p>
                              <p className="text-cafe-500 text-[10px] flex items-center gap-0.5"><Phone size={8} />{c.phone || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-2.5 px-2 text-cafe-300 font-semibold text-xs">{c.points}</td>
                        <td className="text-center py-2.5 px-2">
                          <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${c.status === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' : c.status === 'Silver' ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-500/20 text-orange-400'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-cafe-600 text-xs">BrewMind AI Cafe — Pune's Smartest Cafe Experience</p>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
  index,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  color: string;
  bg: string;
  index: number;
}) {
  return (
    <div className="cafe-card p-4 animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-cafe-400 text-[10px] font-medium mb-1">{label}</p>
          <p className="text-cream font-bold text-base sm:text-lg truncate">{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={color} />
        </div>
      </div>
    </div>
  );
}
