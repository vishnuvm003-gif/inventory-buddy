import api from './axios';

export interface Product {
  id: number;
  name: string;
  type: string;
  category: string;
}

export interface CreateProductRequest {
  name: string;
  type: string;
  category: string;
}

export interface InventoryBatch {
  id: number;
  product_id: number;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  status?: string;
}

export interface CreateBatchRequest {
  product_id: number;
  batch_number: string;
  expiry_date: string;
  quantity: number;
}

export interface Alert {
  batch_id: number;
  batch_number: string;
  product_id: number;
  alert_level: 'attention' | 'emergency' | 'critical';
  status: string;
}

export const managerApi = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  updateProduct: async (id: number, data: CreateProductRequest): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Inventory Batches
  getBatches: async (): Promise<InventoryBatch[]> => {
    const response = await api.get<InventoryBatch[]>('/inventory/batch');
    return response.data;
  },

  createBatch: async (data: CreateBatchRequest): Promise<InventoryBatch> => {
    const response = await api.post<InventoryBatch>('/inventory/batch', data);
    return response.data;
  },

  updateBatchQuantity: async (id: number, quantity: number): Promise<InventoryBatch> => {
    const response = await api.patch<InventoryBatch>(`/inventory/batch/${id}/quantity`, { quantity });
    return response.data;
  },

  updateBatchStatus: async (id: number, status: string): Promise<InventoryBatch> => {
    const response = await api.patch<InventoryBatch>(`/inventory/batch/${id}/status`, { status });
    return response.data;
  },

  deleteBatch: async (id: number): Promise<void> => {
    await api.delete(`/inventory/batch/${id}`);
  },

  // Alerts
  getAlerts: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alerts');
    return response.data;
  },
};
