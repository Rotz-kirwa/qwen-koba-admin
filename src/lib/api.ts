const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('admin_token');

export const api = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  getDashboardKPIs: async () => {
    const res = await fetch(`${API_URL}/admin/dashboard/kpis`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  getProducts: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/products?${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  createProduct: async (data: any) => {
    const res = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateProduct: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  getOrders: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/orders?${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },

  updateOrderStatus: async (id: string, status: string, note?: string) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status, note }),
    });
    return res.json();
  },

  getCustomers: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/admin/customers?${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },
};
