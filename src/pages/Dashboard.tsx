import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Percent,
  DollarSign,
  RotateCcw,
  Package,
  AlertTriangle,
  Star,
  CheckCircle
} from 'lucide-react';

import { api } from '../lib/api';
// import { mockAnalyticsData } from '../data/mockAnalytics';
import { StatCard } from '../components/dashboard/StatCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import type { DateRange } from '../components/dashboard/DashboardFilters';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { InventoryPanel } from '../components/dashboard/InventoryPanel';
import { CustomerInsights } from '../components/dashboard/CustomerInsights';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';

function formatKes(value: number | null | undefined) {
  return `KSh ${(value || 0).toLocaleString()}`;
}

function getTrendDirection(value: number | null | undefined): 'up' | 'down' | 'flat' {
  const amount = Number(value || 0);
  if (amount > 0) return 'up';
  if (amount < 0) return 'down';
  return 'flat';
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const getDaysFromRange = (range: DateRange): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis', dateRange],
    queryFn: () => api.getDashboardKPIs(getDaysFromRange(dateRange)),
  });

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview', dateRange],
    queryFn: () => api.getAnalyticsOverview(getDaysFromRange(dateRange)),
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: () => api.getActivityFeed(20),
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: api.getInventoryAnalytics,
  });

  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-analytics', dateRange],
    queryFn: () => api.getCustomerAnalytics(getDaysFromRange(dateRange)),
  });

  const isLoading = kpisLoading || overviewLoading || activityLoading || inventoryLoading || customerLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Transform API data to match component expectations
  const analytics = {
    totalCustomers: customerData?.top_customers?.length || 0,
    kpis: {
      totalRevenue: kpisData?.kpis?.total_revenue || 0,
      revenueChange: kpisData?.kpis?.revenue_growth || 0,
      totalOrders: kpisData?.kpis?.total_orders || 0,
      ordersChange: kpisData?.kpis?.orders_growth || 0,
      totalCustomers: kpisData?.kpis?.new_customers || 0,
      customersChange: 0, // Will be calculated from customer analytics
      conversionRate: kpisData?.kpis?.conversion_rate || 0,
      conversionChange: 0,
      averageOrderValue: kpisData?.kpis?.avg_order_value || 0,
      aovChange: 0,
      returningCustomers: 0, // Not available in current API
      returningChange: 0,
      productsInStock: inventoryData?.total_products || 0,
      lowStockProducts: inventoryData?.low_stock_count || 0,
    },
    revenueTrends: overviewData?.revenue_trends || [],
    topProducts: overviewData?.top_products || [],
    categoryBreakdown: overviewData?.category_breakdown || [],
    paymentMethods: overviewData?.payment_methods || [],
    trafficSources: overviewData?.traffic_sources || [],
    recentActivity: activityData?.activities || [],
    inventoryHealth: inventoryData?.inventory_health || [],
    customerGrowth: customerData?.customer_growth || [],
    topCustomers: customerData?.top_customers || [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <DashboardFilters selectedRange={dateRange} onRangeChange={setDateRange} />
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatKes(analytics.kpis.totalRevenue)}
          change={analytics.kpis.revenueChange}
          subtitle="vs last period"
          icon={TrendingUp}
          trend={getTrendDirection(analytics.kpis.revenueChange)}
        />
        <StatCard
          title="Total Orders"
          value={analytics.kpis.totalOrders.toLocaleString()}
          change={analytics.kpis.ordersChange}
          subtitle="vs last period"
          icon={ShoppingBag}
          trend={getTrendDirection(analytics.kpis.ordersChange)}
        />
        <StatCard
          title="Customers"
          value={analytics.kpis.totalCustomers.toLocaleString()}
          change={analytics.kpis.customersChange}
          subtitle="vs last period"
          icon={Users}
          trend={getTrendDirection(analytics.kpis.customersChange)}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics.kpis.conversionRate}%`}
          change={analytics.kpis.conversionChange}
          subtitle="vs last period"
          icon={Percent}
          trend={getTrendDirection(analytics.kpis.conversionChange)}
        />
        <StatCard
          title="Average Order Value"
          value={formatKes(analytics.kpis.averageOrderValue)}
          change={analytics.kpis.aovChange}
          subtitle="vs last period"
          icon={DollarSign}
          trend={getTrendDirection(analytics.kpis.aovChange)}
        />
        <StatCard
          title="Repeat Customers"
          value={`${analytics.kpis.returningCustomers}%`}
          change={analytics.kpis.returningChange}
          subtitle="vs last period"
          icon={RotateCcw}
          trend={getTrendDirection(analytics.kpis.returningChange)}
        />
        <StatCard
          title="Products in Stock"
          value={analytics.kpis.productsInStock.toString()}
          subtitle="total inventory"
          icon={Package}
        />
        <StatCard
          title="Low Stock Alerts"
          value={analytics.kpis.lowStockProducts.toString()}
          subtitle="need restocking"
          icon={AlertTriangle}
        />
      </div>

      {/* Today's Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Today's Revenue</p>
              <p className="text-2xl font-bold">{formatKes(analytics.revenueTrends[analytics.revenueTrends.length - 1]?.revenue || 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Best Sales Day</p>
              <p className="text-2xl font-bold">{analytics.revenueTrends.reduce((max: any, day: any) => day.revenue > max.revenue ? day : max, analytics.revenueTrends[0] || { date: 'N/A', revenue: 0 }).date}</p>
              <p className="text-green-100 text-xs">{formatKes(analytics.revenueTrends.reduce((max: any, day: any) => day.revenue > max.revenue ? day : max, analytics.revenueTrends[0] || { revenue: 0 }).revenue)}</p>
            </div>
            <Star className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-2xl font-bold">{analytics.kpis.productsInStock}</p>
            </div>
            <Package className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Top Product</p>
              <p className="text-lg font-bold">{analytics.topProducts[0]?.name || 'N/A'}</p>
              <p className="text-purple-100 text-xs">{analytics.topProducts[0]?.total_quantity || 0} sales</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue Trend"
          subtitle="Daily revenue over the selected period"
          action={
            <select className="text-sm border border-gray-200 rounded px-2 py-1">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number | undefined) => value ? [formatKes(value), 'Revenue'] : ['N/A', 'Revenue']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                fill="#fef3c7"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Orders Trend"
          subtitle="Number of orders placed daily"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                formatter={(value: number | undefined) => value ? [value, 'Orders'] : ['N/A', 'Orders']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Customer Growth"
          subtitle="New customers acquired over time"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                formatter={(value: number | undefined) => value ? [value, 'New Customers'] : ['N/A', 'New Customers']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="new_customers"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top Products"
          subtitle="Best performing products by sales"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                width={100}
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <Tooltip
                formatter={(value: number | undefined, name: string | undefined) => value && name ? [
                  name === 'sales' ? `${value} units` : formatKes(value),
                  name === 'sales' ? 'Units Sold' : 'Revenue'
                ] : ['N/A', 'N/A']}
              />
              <Bar dataKey="total_quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Sales Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Sales by Category"
          subtitle="Revenue distribution by product category"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.categoryBreakdown.map((cat: any, index: number) => ({
                  name: cat.category,
                  value: cat.revenue,
                  color: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'][index % 5]
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.categoryBreakdown.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'][index % 5]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number | undefined) => value ? formatKes(value) : 'N/A'} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Payment Methods"
          subtitle="Payment method preferences"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.paymentMethods.map((method: any, index: number) => ({
                  name: method.method,
                  value: method.revenue,
                  color: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'][index % 5]
                }))}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
              >
                {analytics.paymentMethods.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'][index % 5]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number | undefined) => value ? formatKes(value) : 'N/A'} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Traffic Sources"
          subtitle="How customers find your store"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.trafficSources} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis
                type="category"
                dataKey="source"
                stroke="#6b7280"
                fontSize={12}
                width={80}
              />
              <Tooltip formatter={(value: number | undefined) => value ? `${value} visits` : 'N/A'} />
              <Bar dataKey="visits" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RecentTransactions transactions={[]} />
          <InventoryPanel
            health={analytics.inventoryHealth}
            lowStockItems={analytics.inventoryHealth.filter((item: any) => item.status === 'low_stock').map((item: any) => ({
              name: item.name,
              stock: item.current_stock,
              threshold: item.low_stock_threshold,
            }))}
          />
        </div>

        <div className="space-y-6">
          <ActivityFeed activities={analytics.recentActivity} />
          <CustomerInsights
            newThisMonth={analytics.totalCustomers || 0}
            repeatCustomers={0} // Not available in current API
            topCustomers={analytics.topCustomers.slice(0, 5)}
            locations={[]} // Not available in current API
          />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
