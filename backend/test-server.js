import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test auth routes without Supabase
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }
  
  // Mock response for testing
  res.status(201).json({
    success: true,
    message: 'User registered successfully. (Mock response - Supabase not configured)',
    user: {
      id: 'mock-user-id',
      email: email,
      emailConfirmed: false
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }
  
  // Mock response for testing
  res.json({
    success: true,
    message: 'Login successful (Mock response - Supabase not configured)',
    user: {
      id: 'mock-user-id',
      email: email,
      emailConfirmed: true
    },
    session: {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful (Mock response)'
  });
});

app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header is required'
    });
  }
  
  res.json({
    success: true,
    user: {
      id: 'mock-user-id',
      email: 'test@example.com',
      emailConfirmed: true,
      createdAt: new Date().toISOString(),
      lastSignIn: new Date().toISOString()
    }
  });
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'LivePrompt API Server is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabaseConfigured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY && !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  const supabaseConfigured = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseConfigured) {
    console.log('✅ Supabase is configured');
  } else {
    console.log('⚠️  Supabase is NOT configured - using mock authentication');
    console.log('   Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY');
  }
});
