import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, Users, Percent, AlertTriangle, Package } from 'lucide-react';
import { api } from '../lib/api';

function formatKes(value: number | null | undefined) {
  return `KSh ${(value || 0).toLocaleString()}`;
}

function formatTrend(value: number | null | undefined) {
  const amount = Number(value || 0);
  if (amount > 0) return `+${amount}%`;
  if (amount < 0) return `${amount}%`;
  return "0%";
}

function getTrendDirection(value: number | null | undefined): 'up' | 'down' | 'flat' {
  const amount = Number(value || 0);
  if (amount > 0) return 'up';
  if (amount < 0) return 'down';
  return 'flat';
}

function KPICard({ title, value, change, icon: Icon, trend }: any) {
  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{title}</span>
        <Icon className="w-5 h-5 text-[#8B6F47]" />
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: api.getDashboardKPIs,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={formatKes(kpis?.total_revenue)}
          change={formatTrend(kpis?.revenue_change)}
          icon={TrendingUp}
          trend={getTrendDirection(kpis?.revenue_change)}
        />
        <KPICard
          title="Total Orders"
          value={kpis?.total_orders || 0}
          change={formatTrend(kpis?.orders_change)}
          icon={ShoppingBag}
          trend={getTrendDirection(kpis?.orders_change)}
        />
        <KPICard
          title="Customers"
          value={kpis?.total_customers || 0}
          change={formatTrend(kpis?.customers_change)}
          icon={Users}
          trend={getTrendDirection(kpis?.customers_change)}
        />
        <KPICard
          title="Conversion Rate"
          value={`${kpis?.conversion_rate || 0}%`}
          change={formatTrend(kpis?.conversion_change)}
          icon={Percent}
          trend={getTrendDirection(kpis?.conversion_change)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Low Stock Items</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600">{kpis?.low_stock_items || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Products need restocking</p>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold">Expiring Soon</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{kpis?.expiring_soon_tracked ? (kpis?.expiring_soon || 0) : 'N/A'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {kpis?.expiring_soon_tracked ? 'Batches expiring in 90 days' : 'Expiry tracking is not configured yet'}
          </p>
        </div>
      </div>
    </div>
  );
}
