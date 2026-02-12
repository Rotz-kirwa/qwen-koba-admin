import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 0, orders: 0 },
  { month: 'Feb', revenue: 0, orders: 0 },
  { month: 'Mar', revenue: 0, orders: 0 },
  { month: 'Apr', revenue: 0, orders: 0 },
  { month: 'May', revenue: 0, orders: 0 },
  { month: 'Jun', revenue: 0, orders: 0 },
];

const salesByProduct = [
  { name: 'Clarifier Cream', sales: 0 },
  { name: 'Clarifier Serum', sales: 0 },
  { name: 'Clarifying Mask', sales: 0 },
  { name: 'Clarifying Cleanser', sales: 0 },
  { name: 'Clarifying Toner', sales: 0 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-gray-900">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Revenue (30d)</span>
            <DollarSign className="w-5 h-5 text-[#8B6F47]" />
          </div>
          <p className="text-3xl font-bold">$0</p>
          <p className="text-sm text-gray-500 mt-2">No data yet</p>
        </div>
        
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Orders</span>
            <BarChart3 className="w-5 h-5 text-[#8B6F47]" />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500 mt-2">No data yet</p>
        </div>
        
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Customers</span>
            <Users className="w-5 h-5 text-[#8B6F47]" />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500 mt-2">No data yet</p>
        </div>
        
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Avg Order Value</span>
            <TrendingUp className="w-5 h-5 text-[#8B6F47]" />
          </div>
          <p className="text-3xl font-bold">$0</p>
          <p className="text-sm text-gray-500 mt-2">No data yet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#8B6F47" fill="#8B6F47" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card p-6">
          <h3 className="font-semibold text-lg mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#8B6F47" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-card p-6">
        <h3 className="font-semibold text-lg mb-4">Sales by Product</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesByProduct}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#8B6F47" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
