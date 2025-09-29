'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12">
  <LoginForm />
      </div>
    </ProtectedRoute>
  );
}
