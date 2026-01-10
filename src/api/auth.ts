import api from './axios';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: 'admin' | 'manager';
}

export interface LoginResponse {
  access_token: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await api.post('/register', data);
  },
};
