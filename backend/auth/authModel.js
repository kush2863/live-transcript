import { supabase, supabaseAdmin } from '../supabase.js';

export class AuthModel {
  // Helper method to check if Supabase is configured
  static _checkSupabaseConfig() {
    if (!supabase || !supabaseAdmin) {
      throw new Error('Supabase is not properly configured. Please check your environment variables.');
    }
  }

  // Sign up a new user
  static async signUp(email, password, userData = {}) {
    try {
      this._checkSupabaseConfig();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          // Disable email confirmation for development
          emailRedirectTo: undefined
        }
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign in user
  static async signIn(email, password) {
    try {
      this._checkSupabaseConfig();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign out user
  static async signOut(accessToken) {
    try {
      this._checkSupabaseConfig();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user by access token
  static async getUser(accessToken) {
    try {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Refresh session
  static async refreshSession(refreshToken) {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update password
  static async updatePassword(accessToken, newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Verify user token (admin operation)
  static async verifyToken(token) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
