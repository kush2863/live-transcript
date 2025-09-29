# LivePrompt Authentication System

A full-stack authentication system built with Next.js, Express.js, Supabase, and Shadcn UI.

## 🚀 Features

- **Frontend**: Next.js 15 with TypeScript and Shadcn UI components
- **Backend**: Express.js API with Supabase authentication
- **Authentication**: Complete signup/signin flow with JWT tokens
- **Form Validation**: Zod schema validation with react-hook-form
- **Protected Routes**: Middleware-based route protection
- **Modern UI**: Beautiful, accessible components from Shadcn UI
- **Type Safety**: Full TypeScript support throughout

## 📁 Project Structure

```
liveprompt_tasl/
├── backend/
│   ├── index.js              # Main server file
│   ├── supabase.js           # Supabase client configuration
│   ├── routes/
│   │   └── auth.js           # Authentication routes
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── package.json
│   └── .env                  # Backend environment variables
├── frontend/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main page with auth flow
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # Shadcn UI components
│   │   ├── AuthContainer.tsx # Auth flow container
│   │   ├── LoginForm.tsx     # Login form with validation
│   │   ├── SignupForm.tsx    # Signup form with validation
│   │   └── Dashboard.tsx     # Protected dashboard
│   ├── lib/
│   │   ├── api.ts            # API client configuration
│   │   ├── hooks/
│   │   │   └── useApi.ts     # Custom API hooks
│   │   └── services/
│   │       └── auth.ts       # Authentication service
│   ├── package.json
│   └── .env.local            # Frontend environment variables
```

## 🛠 Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file with your Supabase credentials:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=4000
```

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Update `.env.local` with backend URL:
```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Environment
NODE_ENV=development
```

Start the frontend development server:
```bash
npm run dev
```

## 🔌 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/signup` | Create new user account | No |
| POST | `/api/v1/auth/signin` | Sign in existing user | No |
| POST | `/api/v1/auth/signout` | Sign out user | Yes |
| GET | `/api/v1/auth/me` | Get current user info | Yes |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |

### Other Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | API health check with endpoints list | No |
| GET | `/test-db` | Test Supabase database connection | No |
| GET | `/api/v1/protected` | Example protected route | Yes |

## 📝 Request/Response Examples

### Signup Request
```bash
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### Signup Response
```json
{
  "success": true,
  "message": "User created successfully! Please check your email to confirm your account.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2025-01-01T00:00:00Z"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_in": 3600
    }
  }
}
```

### Signin Request
```bash
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Protected Route Request
```bash
GET /api/v1/protected
Authorization: Bearer your_jwt_token
```

## 🎨 Frontend Components

### AuthContainer
Main component that switches between login and signup forms based on user interaction.

### LoginForm
- Built with Shadcn UI components
- Zod schema validation
- React Hook Form integration
- Loading states and error handling

### SignupForm
- Form validation with password confirmation
- Proper error display
- Responsive design

### Dashboard
- Protected user dashboard
- User information display
- Protected route testing
- Logout functionality

## 🔐 Authentication Flow

1. **User Registration**: User fills signup form → Backend creates Supabase user → Returns JWT tokens
2. **User Login**: User fills login form → Backend authenticates with Supabase → Returns JWT tokens
3. **Token Storage**: Frontend stores access_token in localStorage
4. **API Requests**: All API requests include Bearer token in Authorization header
5. **Route Protection**: Backend middleware validates JWT on protected routes
6. **Auto-logout**: Invalid/expired tokens trigger automatic logout

## 🛡 Security Features

- **JWT Token Authentication**: Secure token-based authentication
- **Password Validation**: Minimum 6 characters with confirmation
- **Email Validation**: Proper email format validation
- **CORS Protection**: Configured for specific origins
- **Input Sanitization**: Zod schema validation on frontend
- **Error Handling**: Comprehensive error messages without exposing sensitive data

## 🎯 Key Technologies

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, React Hook Form, Zod
- **Backend**: Express.js, Supabase, CORS, dotenv
- **Authentication**: Supabase Auth with JWT tokens
- **Styling**: Tailwind CSS with Shadcn UI component system
- **Validation**: Zod schemas with react-hook-form integration

## 🚀 Getting Started

1. Clone the repository
2. Set up Supabase project and get credentials
3. Configure backend `.env` with Supabase credentials
4. Configure frontend `.env.local` with backend URL
5. Install dependencies and start both servers
6. Visit `http://localhost:3000` to see the auth flow

## 📱 Usage

1. **Visit the app** - Shows login form by default
2. **Create Account** - Click "Sign up" to create new account
3. **Sign In** - Use email/password to authenticate
4. **Dashboard** - Access protected dashboard after authentication
5. **Test Features** - Try protected route calls and user info display
6. **Sign Out** - Logout and return to login screen

The system provides a complete, production-ready authentication flow with modern UI components and robust error handling.
