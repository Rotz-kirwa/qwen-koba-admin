import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, Package, X, CheckCircle, Truck } from 'lucide-react';
import { api } from '../lib/api';
import { useState } from 'react';
import { formatNairobiDate, formatNairobiDateTime } from '../lib/datetime';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  payment_failed: 'bg-red-100 text-red-800',
};

const formatKes = (amount?: number) => `KSh ${(amount || 0).toLocaleString()}`;

export default function Orders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: api.getOrders,
    refetchInterval: 10000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const orders = data?.orders || [];
  const filteredOrders = orders.filter((o: any) => {
    const matchesSearch = o.order_id?.toLowerCase().includes(search.toLowerCase()) ||
                         o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
                         o.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };

  const pendingOrders = orders.filter((o: any) => o.order_status === 'pending' || o.order_status === 'processing').length;
  // const completedOrders = orders.filter((o: any) => o.order_status === 'delivered').length;
  const totalRevenue = orders
    .filter((o: any) => o.payment_status === 'paid')
    .reduce((sum: number, o: any) => sum + (o.grand_total_kes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Orders</span>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>
        
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending</span>
            <Truck className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
        
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Revenue</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{formatKes(totalRevenue)}</p>
        </div>
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="payment_failed">Payment Failed</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-mono text-sm">{order.order_id}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium">{order.customer_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.customer_email || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4">{order.items?.length || 0} items</td>
                    <td className="py-4 px-4 font-semibold">{formatKes(order.grand_total_kes)}</td>
                    <td className="py-4 px-4">
                      <select
                        value={order.order_status || 'pending'}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded-full border-0 ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="payment_failed">Payment Failed</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatNairobiDate(order.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewingOrder(order)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <button onClick={() => setViewingOrder(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Order ID</label>
                  <p className="font-mono font-semibold">{viewingOrder.order_id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Date</label>
                  <p className="font-semibold">{formatNairobiDateTime(viewingOrder.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className="font-semibold capitalize">{viewingOrder.order_status}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Payment Status</label>
                  <p className="font-semibold capitalize">{viewingOrder.payment_status}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Customer</label>
                  <p className="font-semibold">{viewingOrder.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Payment Method</label>
                  <p className="font-semibold capitalize">{viewingOrder.payment_method || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2">
                  {viewingOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">
                        {formatKes(item.item_total_kes ?? item.item_total ?? 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="font-semibold">{formatKes(viewingOrder.subtotal_kes)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Shipping</span>
                    <span className="font-semibold">{formatKes(viewingOrder.shipping_kes)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Grand Total</span>
                    <span className="text-2xl font-bold text-[#8B6F47]">{formatKes(viewingOrder.grand_total_kes)}</span>
                  </div>
                </div>
              </div>

              {viewingOrder.shipping_address && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{viewingOrder.shipping_address.name}</p>
                    <p>{viewingOrder.shipping_address.email}</p>
                    <p>{viewingOrder.shipping_address.address}</p>
                    <p>{viewingOrder.shipping_address.city}, {viewingOrder.shipping_address.country}</p>
                    <p>{viewingOrder.shipping_address.phone}</p>
                    <p>{viewingOrder.shipping_address.county} · {viewingOrder.shipping_address.delivery_point}</p>
                    <p className="capitalize">{viewingOrder.shipping_address.delivery_method} · {viewingOrder.shipping_address.delivery_eta}</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Payment Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Method: <span className="font-medium capitalize">{viewingOrder.payment_method || 'N/A'}</span></p>
                  <p>Status: <span className="font-medium capitalize">{viewingOrder.payment_status || 'N/A'}</span></p>
                  {viewingOrder.payment_receipt && <p>Receipt: <span className="font-medium">{viewingOrder.payment_receipt}</span></p>}
                  {viewingOrder.payment_details?.phone_number && <p>Phone: <span className="font-medium">{viewingOrder.payment_details.phone_number}</span></p>}
                </div>
              </div>

              {viewingOrder.events?.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Order Timeline</h3>
                  <div className="space-y-3">
                    {viewingOrder.events.slice().reverse().map((event: any, idx: number) => (
                      <div key={`${event.created_at}-${idx}`} className="rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium text-sm text-gray-900">{event.message}</p>
                          <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                            {event.category || event.type}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {formatNairobiDateTime(event.created_at)} · {event.actor || 'system'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
