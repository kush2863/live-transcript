'use client';

import Link from 'next/link';
import { useAuth } from '../lib/hooks/useAuth';
import { Button } from './ui/button';
import { User, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">LivePrompt</div>
          </Link>

          {/* Desktop Navigation & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-sm">Loading...</span>
              </div>
            ) : user ? (
              // Authenticated user
              <div className="flex items-center space-x-4">
                {/* Navigation links for authenticated users */}
                <nav className="flex items-center space-x-4">
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/upload" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Upload
                  </Link>
                  <Link href="/jobs" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Jobs
                  </Link>
                </nav>

                {/* User info */}
                <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <User className="h-4 w-4" />
                  <span className="truncate max-w-[150px]" title={user.email}>
                    {user.email}
                  </span>
                  {user.emailConfirmed && (
                    <span className="text-green-600 text-xs">✓</span>
                  )}
                </div>

                {/* Sign out button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              // Non-authenticated user
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                
                <Link href="/register">
                  <Button 
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="pt-4 space-y-3">
              {loading ? (
                <div className="flex items-center space-x-2 text-gray-500 px-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : user ? (
                // Authenticated user mobile menu
                <div className="space-y-3">
                  {/* User info */}
                  <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <User className="h-4 w-4" />
                    <span className="truncate" title={user.email}>
                      {user.email}
                    </span>
                    {user.emailConfirmed && (
                      <span className="text-green-600 text-xs">✓</span>
                    )}
                  </div>

                  {/* Navigation links */}
                  <Link 
                    href="/dashboard" 
                    className="block text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/upload" 
                    className="block text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Upload
                  </Link>
                  <Link 
                    href="/jobs" 
                    className="block text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Jobs
                  </Link>

                  {/* Sign out button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                // Non-authenticated user mobile menu
                <div className="space-y-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                  
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      size="sm"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
