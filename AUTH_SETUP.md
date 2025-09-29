# LivePrompt Authentication Setup

This document explains the complete authentication system implementation for LivePrompt, using Supabase as the backend authentication provider with a custom Express.js API layer.

## Architecture Overview

The authentication system follows a **backend-first approach** where:
- Frontend communicates only with your Express.js backend
- Backend handles all Supabase interactions
- JWT tokens are managed securely through the backend
- Frontend uses a clean, simple API interface

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000

# JWT Configuration (optional)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

### 2. Database Schema

The system uses Supabase's built-in auth system plus custom tables. Run this SQL in your Supabase SQL editor:

```sql
-- Jobs table to track processing status
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'transcribing', 'analyzing', 'completed', 'failed')),
  transcript_data JSONB,
  analysis_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table to store final reports
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  key_points JSONB NOT NULL,
  action_items JSONB NOT NULL,
  full_transcript JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own jobs" ON jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own reports" ON reports FOR ALL USING (auth.uid() IN (SELECT user_id FROM jobs WHERE id = job_id));
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Start Backend Server

```bash
npm run dev
```

The backend will start on `http://localhost:3001`

## Frontend Setup

### 1. Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Start Frontend Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication Routes

All routes are prefixed with `/api/auth`:

- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get current user profile (protected)
- `POST /refresh-token` - Refresh access token
- `POST /forgot-password` - Request password reset
- `PUT /update-password` - Update password (protected)

### Request/Response Examples

#### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Access Protected Route
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend Usage

### Authentication Hook

```tsx
import { useAuth } from '../lib/hooks/useAuth';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <button onClick={() => signIn(email, password)}>Sign In</button>;
  }

  return (
    <div>
      Welcome, {user.email}!
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

```tsx
import ProtectedRoute from '../components/ProtectedRoute';

function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

### API Client

```tsx
import { apiClient } from '../lib/api';

// Automatically includes auth headers
const data = await apiClient.get('/some-endpoint');
const result = await apiClient.post('/another-endpoint', { data: 'value' });
```

## Security Features

1. **JWT Token Management**: Automatic token refresh before expiration
2. **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
3. **CORS Protection**: Configured to only allow requests from frontend domain
4. **Row Level Security**: Supabase RLS ensures users only access their own data
5. **Input Validation**: All inputs validated on both frontend and backend
6. **Password Requirements**: Minimum 6 characters (can be extended)

## File Structure

```
backend/
├── auth/
│   ├── authController.js    # Request handlers
│   ├── authModel.js         # Supabase interactions
│   └── authRoute.js         # Route definitions
├── middleware/
│   └── auth.js              # Authentication middleware
├── supabase.js              # Supabase configuration
└── index.js                 # Main server file

frontend/
├── lib/
│   ├── hooks/
│   │   └── useAuth.tsx      # Authentication hook
│   └── services/
│       └── auth.ts          # Auth service functions
├── components/
│   └── ProtectedRoute.tsx   # Route protection component
└── app/
    ├── login/
    ├── register/
    └── dashboard/
```

## Troubleshooting

### Backend Issues

1. **Module Import Errors**: Ensure `"type": "module"` is set in `package.json`
2. **CORS Errors**: Check `FRONTEND_URL` in environment variables
3. **Supabase Connection**: Verify all Supabase environment variables are correct
4. **Database Errors**: Ensure RLS policies are correctly configured

### Frontend Issues

1. **API Connection**: Verify `NEXT_PUBLIC_API_URL` points to backend
2. **Authentication State**: Check browser's localStorage for tokens
3. **Protected Routes**: Ensure AuthProvider wraps your app in layout.tsx

### Common Error Messages

- **"Cannot use import statement outside a module"**: Add `"type": "module"` to package.json
- **"Access token is required"**: Include Authorization header in API requests
- **"CORS policy error"**: Check backend CORS configuration and frontend URL
- **"Invalid or expired token"**: Token may need refresh or user needs to log in again

## Next Steps

1. **Email Verification**: Configure Supabase email templates
2. **Social Login**: Add OAuth providers (Google, GitHub, etc.)
3. **Password Strength**: Implement stronger password requirements
4. **Rate Limiting**: Add request rate limiting for security
5. **Audit Logging**: Track authentication events
6. **Multi-factor Authentication**: Add 2FA support

## Production Considerations

1. **Environment Variables**: Use secure secret management
2. **HTTPS**: Ensure all communication is encrypted
3. **Token Storage**: Consider httpOnly cookies instead of localStorage
4. **Database Backups**: Configure automated Supabase backups
5. **Monitoring**: Set up logging and error tracking
6. **CDN**: Use CDN for static assets
7. **Load Balancing**: Scale backend servers as needed

This authentication system provides a solid foundation for your LivePrompt application with security best practices and room for future enhancements.
