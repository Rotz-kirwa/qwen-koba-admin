import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, Users, Percent, AlertTriangle, Package } from 'lucide-react';
import { api } from '../lib/api';

function KPICard({ title, value, change, icon: Icon, trend }: any) {
  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{title}</span>
        <Icon className="w-5 h-5 text-[#8B6F47]" />
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
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
          value={`$${kpis?.total_revenue?.toLocaleString() || 0}`}
          change="+12.5%"
          icon={TrendingUp}
          trend="up"
        />
        <KPICard
          title="Total Orders"
          value={kpis?.total_orders || 0}
          change="+8.2%"
          icon={ShoppingBag}
          trend="up"
        />
        <KPICard
          title="Customers"
          value={kpis?.total_customers || 0}
          change="+15.3%"
          icon={Users}
          trend="up"
        />
        <KPICard
          title="Conversion Rate"
          value={`${kpis?.conversion_rate || 0}%`}
          change="-2.1%"
          icon={Percent}
          trend="down"
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
          <p className="text-3xl font-bold text-red-600">{kpis?.expiring_soon || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Batches expiring in 90 days</p>
        </div>
      </div>
    </div>
  );
}
