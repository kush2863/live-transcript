import { AuthModel } from '../auth/authModel.js';

// Middleware to authenticate users
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header is required'
      });
    }

    const token = authHeader.split(' ')[1]; // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
    }

    const result = await AuthModel.verifyToken(token);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Add user to request object
    req.user = result.user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Optional middleware for routes that can work with or without auth
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        const result = await AuthModel.verifyToken(token);
        
        if (result.success) {
          req.user = result.user;
          req.token = token;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Middleware to check if user email is verified
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.email_confirmed_at) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required'
    });
  }
  next();
};
