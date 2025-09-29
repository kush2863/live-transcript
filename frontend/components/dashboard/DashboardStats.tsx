"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AudioJob } from '@/lib/types/audio';

interface DashboardStatsProps {
  jobs: AudioJob[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ jobs }) => {
  const completed = jobs.filter(j => j.status === 'completed').length;
  const processing = jobs.filter(j => ['transcribing', 'analyzing'].includes(j.status)).length;
  const failed = jobs.filter(j => j.status === 'failed').length;

  const StatCard = ({ label, value, className='' }: { label: string; value: number; className?: string }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="Total Jobs" value={jobs.length} />
      <StatCard label="Completed" value={completed} className="text-green-600" />
      <StatCard label="Processing" value={processing} className="text-blue-600" />
      <StatCard label="Failed" value={failed} className="text-red-600" />
    </div>
  );
};

export default DashboardStats;