const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('admin_token');

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || data?.message || 'Request failed');
  }
  return data;
};

export const api = {
  login: async (email: string, password: string) => {
    return request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getDashboardKPIs: async () => {
    return request('/admin/dashboard/kpis');
  },

  getProducts: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/products${query ? `?${query}` : ''}`);
  },

  createProduct: async (data: any) => {
    return request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (id: string, data: any) => {
    return request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (id: string) => {
    return request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  getOrders: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },

  updateOrderStatus: async (id: string, status: string, note?: string) => {
    return request(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  },

  getCustomers: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/customers${query ? `?${query}` : ''}`);
  },
};
