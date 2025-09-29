'use client';

import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAudioJobs } from '@/lib/hooks/useAudioJobs';
import DashboardWelcome from '@/components/dashboard/DashboardWelcome';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentJobs from '@/components/dashboard/RecentJobs';

const Dashboard = () => {
  const { user } = useAuth();
  const { jobs, loading, error } = useAudioJobs();

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
  <DashboardWelcome user={user} />
  <DashboardStats jobs={jobs} />
  <RecentJobs jobs={jobs} loading={loading} error={error} />

  {/* Extend: Additional widgets can be inserted here */}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;