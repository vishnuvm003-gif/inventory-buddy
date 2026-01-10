import api from './axios';

export interface ExpiryRule {
  id: number;
  product_type: string;
  attention_days: number;
  emergency_days: number;
  critical_days: number;
}

export interface CreateExpiryRuleRequest {
  product_type: string;
  attention_days: number;
  emergency_days: number;
  critical_days: number;
}

export const adminApi = {
  getExpiryRules: async (): Promise<ExpiryRule[]> => {
    const response = await api.get<ExpiryRule[]>('/expiry-rules');
    return response.data;
  },

  createExpiryRule: async (data: CreateExpiryRuleRequest): Promise<ExpiryRule> => {
    const response = await api.post<ExpiryRule>('/expiry-rules', data);
    return response.data;
  },

  updateExpiryRule: async (id: number, data: CreateExpiryRuleRequest): Promise<ExpiryRule> => {
    const response = await api.put<ExpiryRule>(`/expiry-rules/${id}`, data);
    return response.data;
  },

  deleteExpiryRule: async (id: number): Promise<void> => {
    await api.delete(`/expiry-rules/${id}`);
  },
};
