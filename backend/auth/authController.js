import { AuthModel } from './authModel.js';

export class AuthController {
  // Handle user registration
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      const userData = {};
      if (firstName) userData.first_name = firstName;
      if (lastName) userData.last_name = lastName;

      const result = await AuthModel.signUp(email, password, userData);

      if (!result.success) {
        // Handle specific Supabase errors
        let errorMessage = result.error;
        let statusCode = 400;
        
        if (result.error?.includes('User already registered')) {
          errorMessage = 'An account with this email already exists';
          statusCode = 409;
        } else if (result.error?.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address';
        } else if (result.error?.includes('Password')) {
          errorMessage = 'Password does not meet requirements';
        }
        
        return res.status(statusCode).json({
          success: false,
          error: errorMessage
        });
      }

      // In development, auto-confirm users to avoid email verification issues
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      res.status(201).json({
        success: true,
        message: isDevelopment 
          ? 'User registered successfully. You can now sign in.' 
          : 'User registered successfully. Please check your email for verification.',
        user: {
          id: result.user.id,
          email: result.user.email,
          emailConfirmed: result.user.email_confirmed_at !== null || isDevelopment
        },
        developmentMode: isDevelopment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Handle user login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await AuthModel.signIn(email, password);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          emailConfirmed: result.user.email_confirmed_at !== null
        },
        session: {
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
          expires_at: result.session.expires_at
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Handle user logout
  static async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        await AuthModel.signOut(token);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      res.json({
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          emailConfirmed: req.user.email_confirmed_at !== null,
          createdAt: req.user.created_at,
          lastSignIn: req.user.last_sign_in_at
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      const result = await AuthModel.refreshSession(refresh_token);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json({
        success: true,
        session: {
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
          expires_at: result.session.expires_at
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Handle password reset request
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const result = await AuthModel.resetPassword(email);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Handle password update
  static async updatePassword(req, res) {
    try {
      const { newPassword, confirmPassword } = req.body;

      if (!newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'New password and confirmation are required'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Passwords do not match'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      const result = await AuthModel.updatePassword(token, newPassword);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Verify JWT token and return user info
  static async verifyToken(req, res) {
    try {
      // If we reach here, the token is valid (middleware already verified it)
      // req.user is set by the auth middleware
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
