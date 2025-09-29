"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters long'); setLoading(false); return; }
    try {
      const result = await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
      if (result.success) { setSuccess(true); setTimeout(() => router.push('/login'), 3000); } else setError(result.error || 'Registration failed');
    } catch { setError('An unexpected error occurred'); } finally { setLoading(false); }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="text-center p-6">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-xl font-semibold mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">Please check your email for verification instructions.</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up for a new LivePrompt account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} disabled={loading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required disabled={loading} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
          <div className="text-sm text-center">Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link></div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;