import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { api } from '../lib/api';

type AnalyticsResponse = {
  analytics?: {
    summary?: {
      revenue_30d_kes?: number;
      orders_30d?: number;
      customers_30d?: number;
      avg_order_value_30d_kes?: number;
    };
    monthly?: Array<{
      month: string;
      revenue: number;
      orders: number;
    }>;
    top_products?: Array<{
      name: string;
      sales: number;
      revenue: number;
    }>;
  };
};

const formatKes = (value: number | null | undefined) => `KSh ${(value || 0).toLocaleString()}`;
const normalizeTooltipValue = (value: unknown) => Array.isArray(value) ? value[0] : value;
const formatTooltipValue = (value: unknown) => {
  const normalized = normalizeTooltipValue(value);
  return typeof normalized === 'number' ? formatKes(normalized) : normalized ?? '';
};
const formatMixedTooltipValue = (value: unknown, key: string) => {
  const normalized = normalizeTooltipValue(value);
  return key === 'revenue' && typeof normalized === 'number' ? formatKes(normalized) : normalized ?? '';
};

function SummaryCard({ title, value, subtitle, icon: Icon }: any) {
  return (
    <div className="admin-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        <Icon className="h-5 w-5 text-[#8B6F47]" />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

export default function Analytics() {
  const { data, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ['analytics-overview'],
    queryFn: api.getAnalyticsOverview,
  });

  const analytics = data?.analytics;
  const summary = analytics?.summary;
  const monthly = analytics?.monthly || [];
  const topProducts = analytics?.top_products || [];
  const hasData = monthly.some((entry) => entry.revenue > 0 || entry.orders > 0) || topProducts.length > 0;

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-500">Revenue, orders, and product performance from real storefront activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Revenue (30d)"
          value={formatKes(summary?.revenue_30d_kes)}
          subtitle="Paid orders in the last 30 days"
          icon={DollarSign}
        />
        <SummaryCard
          title="Orders (30d)"
          value={summary?.orders_30d || 0}
          subtitle="All orders created in the last 30 days"
          icon={BarChart3}
        />
        <SummaryCard
          title="Customers (30d)"
          value={summary?.customers_30d || 0}
          subtitle="New customer accounts in the last 30 days"
          icon={Users}
        />
        <SummaryCard
          title="Avg Order Value"
          value={formatKes(summary?.avg_order_value_30d_kes)}
          subtitle="Average paid order over the last 30 days"
          icon={TrendingUp}
        />
      </div>

      {hasData ? (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="admin-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatTooltipValue(value)} />
                  <Area type="monotone" dataKey="revenue" stroke="#8B6F47" fill="#8B6F47" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Orders Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#8B6F47" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Top Selling Products</h3>
              <span className="text-sm text-gray-500">Paid order volume</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-8} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip formatter={(value, key) => formatMixedTooltipValue(value, String(key))} />
                <Bar dataKey="sales" fill="#8B6F47" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="admin-card p-10 text-center">
          <h3 className="text-xl font-semibold text-gray-900">No analytics data yet</h3>
          <p className="mt-2 text-gray-500">
            Analytics will populate automatically as customers place orders and complete payments.
          </p>
        </div>
      )}
    </div>
  );
}
