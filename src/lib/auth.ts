import { jwtDecode } from 'jwt-decode';
import { JWTPayload, AuthUser } from '@/types';

export class AuthManager {
  private static instance: AuthManager;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private refreshKey = 'refresh_token';

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Token management
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.refreshKey);
  }

  // Refresh token management
  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.refreshKey, token);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.refreshKey);
  }

  // User data management
  setUser(user: AuthUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Token validation
  isTokenValid(token?: string): boolean {
    const authToken = token || this.getToken();
    if (!authToken) return false;

    try {
      const decoded = jwtDecode<JWTPayload>(authToken);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Token expiration check
  getTokenExpirationTime(token?: string): number | null {
    const authToken = token || this.getToken();
    if (!authToken) return null;

    try {
      const decoded = jwtDecode<JWTPayload>(authToken);
      return decoded.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }

  // Check if token expires soon (within 5 minutes)
  shouldRefreshToken(token?: string): boolean {
    const expirationTime = this.getTokenExpirationTime(token);
    if (!expirationTime) return false;

    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return expirationTime < fiveMinutesFromNow;
  }

  // Authentication status
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user && this.isTokenValid(token));
  }

  // Role checking
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }

  // Permission checking
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isModerator(): boolean {
    return this.hasAnyRole(['admin', 'moderator']);
  }

  // Logout
  logout(): void {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Auto-refresh token
  async autoRefreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await authApi.refreshToken();
      if (response.success && response.data) {
        this.setToken(response.data.token);
        if (response.data.user) {
          this.setUser(response.data.user);
        }
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
    return false;
  }
}

export const auth = AuthManager.getInstance();