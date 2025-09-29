'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12">
  <RegisterForm />
      </div>
    </ProtectedRoute>
  );
}
