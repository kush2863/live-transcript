export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
  createdAt?: string;
  lastSignIn?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  error?: string;
  message?: string;
}

class AuthService {
  // Ensure this matches backend server (backend default PORT=4000)
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  // Sign up a new user
  async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Sign in user
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      
      // Store session data in localStorage
      if (data.success && data.session) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        localStorage.setItem('expires_at', data.session.expires_at.toString());
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Sign out user
  async signOut(): Promise<AuthResponse> {
    try {
      const token = this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      // Clear local storage regardless of response
      this.clearSession();

      const data = await response.json();
      return data;
    } catch (error) {
      // Clear session even if network request fails
      this.clearSession();
      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = this.getAccessToken();
      
      if (!token) {
        return {
          success: false,
          error: 'No access token found',
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get user profile',
      };
    }
  }

  // Refresh access token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return {
          success: false,
          error: 'No refresh token found',
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();
      
      // Update stored tokens
      if (data.success && data.session) {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        localStorage.setItem('expires_at', data.session.expires_at.toString());
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to refresh token',
      };
    }
  }

  // Request password reset
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Update password
  async updatePassword(newPassword: string, confirmPassword: string): Promise<AuthResponse> {
    try {
      const token = this.getAccessToken();
      
      if (!token) {
        return {
          success: false,
          error: 'No access token found',
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Helper methods
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('expires_at');
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt) * 1000;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired();
  }

  clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
  }

  // Automatic token refresh
  async ensureValidToken(): Promise<string | null> {
    const token = this.getAccessToken();
    
    if (!token) return null;
    
    if (this.isTokenExpired()) {
      const refreshResult = await this.refreshToken();
      if (refreshResult.success && refreshResult.session) {
        return refreshResult.session.access_token;
      } else {
        this.clearSession();
        return null;
      }
    }
    
    return token;
  }
}

export const authService = new AuthService();
export default authService;
