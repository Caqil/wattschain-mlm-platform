import { ApiResponse, PaginationParams, FilterParams } from '@/types';
import { toast } from 'sonner';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token from localStorage or cookies
    const token = this.getAuthToken();
    const headers = {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json() as ApiResponse<T>;

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          this.handleUnauthorized();
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token') || null;
  }

  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${searchParams}`);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Paginated requests
  async getPaginated<T>(
    endpoint: string,
    pagination: PaginationParams = {},
    filters: FilterParams = {}
  ): Promise<ApiResponse<T[]>> {
    const params = {
      page: pagination.page?.toString() || '1',
      limit: pagination.limit?.toString() || '20',
      sortBy: pagination.sortBy || 'createdAt',
      sortOrder: pagination.sortOrder || 'desc',
      ...filters,
    };

    return this.get<T[]>(endpoint, params);
  }

  // File upload
  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`File Upload Error (${endpoint}):`, error);
      throw error;
    }
  }
}

// Create and export API client instance
export const api = new ApiClient();

// Specific API functions for different domains
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
  
  resendVerification: () =>
    api.post('/auth/resend-verification'),
};

export const userApi = {
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (data: any) =>
    api.patch('/user/profile', data),
  
  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    api.patch('/user/change-password', passwords),
  
  uploadAvatar: (file: File) =>
    api.uploadFile('/user/avatar', file),
  
  getTransactions: (pagination?: PaginationParams, filters?: FilterParams) =>
    api.getPaginated('/user/transactions', pagination, filters),
  
  getWallet: () =>
    api.get('/user/wallet'),
};

export const mlmApi = {
  getTree: () =>
    api.get('/mlm/tree'),
  
  getReferrals: (pagination?: PaginationParams) =>
    api.getPaginated('/mlm/referrals', pagination),
  
  getCommissions: (pagination?: PaginationParams, filters?: FilterParams) =>
    api.getPaginated('/mlm/commissions', pagination, filters),
  
  requestWithdrawal: (data: any) =>
    api.post('/mlm/withdraw', data),
  
  validateReferralCode: (code: string) =>
    api.post('/mlm/validate-referral', { code }),
  
  getStats: () =>
    api.get('/mlm/stats'),
};

export const kycApi = {
  getStatus: () =>
    api.get('/kyc/status'),
  
  submitDocuments: (documents: any) =>
    api.post('/kyc/submit', documents),
  
  uploadDocument: (type: string, file: File) =>
    api.uploadFile('/kyc/upload', file, { type }),
  
  getRequirements: () =>
    api.get('/kyc/requirements'),
};

export const paymentApi = {
  createPayment: (data: any) =>
    api.post('/payment/create', data),
  
  getPaymentMethods: () =>
    api.get('/payment/methods'),
  
  initiateStripePayment: (data: any) =>
    api.post('/payment/stripe/create', data),
  
  initiateMpesaPayment: (data: any) =>
    api.post('/payment/mpesa/stk-push', data),
  
  initiateCryptoPayment: (data: any) =>
    api.post('/payment/crypto/create', data),
  
  verifyPayment: (paymentId: string) =>
    api.get(`/payment/verify/${paymentId}`),
};

export const adminApi = {
  // User Management
  getUsers: (pagination?: PaginationParams, filters?: FilterParams) =>
    api.getPaginated('/admin/users', pagination, filters),
  
  getUserById: (id: string) =>
    api.get(`/admin/users/${id}`),
  
  updateUser: (id: string, data: any) =>
    api.patch(`/admin/users/${id}`, data),
  
  banUser: (id: string, reason: string) =>
    api.post(`/admin/users/${id}/ban`, { reason }),
  
  unbanUser: (id: string) =>
    api.post(`/admin/users/${id}/unban`),
  
  // KYC Management
  getKycReviews: (pagination?: PaginationParams, filters?: FilterParams) =>
    api.getPaginated('/admin/kyc-reviews', pagination, filters),
  
  approveKyc: (id: string, notes?: string) =>
    api.post(`/admin/kyc-reviews/${id}/approve`, { notes }),
  
  rejectKyc: (id: string, reason: string, notes?: string) =>
    api.post(`/admin/kyc-reviews/${id}/reject`, { reason, notes }),
  
  // Transaction Management
  getTransactions: (pagination?: PaginationParams, filters?: FilterParams) =>
    api.getPaginated('/admin/transactions', pagination, filters),
  
  refundTransaction: (id: string, reason: string) =>
    api.post(`/admin/transactions/${id}/refund`, { reason }),
  
  // Settings Management
  getMLMSettings: () =>
    api.get('/admin/settings/mlm'),
  
  updateMLMSettings: (data: any) =>
    api.patch('/admin/settings/mlm', data),
  
  getPresaleSettings: () =>
    api.get('/admin/settings/presale'),
  
  updatePresaleSettings: (data: any) =>
    api.patch('/admin/settings/presale', data),
  
  // Reports
  getDashboardStats: () =>
    api.get('/admin/reports/dashboard'),
  
  getFinancialReport: (dateRange: { startDate: string; endDate: string }) =>
    api.get('/admin/reports/financial', dateRange),
  
  getMLMReport: (dateRange: { startDate: string; endDate: string }) =>
    api.get('/admin/reports/mlm', dateRange),
  
  exportData: (type: string, filters: any) =>
    api.post('/admin/export', { type, filters }),
};
