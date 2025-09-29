"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileAudio } from 'lucide-react';


interface DashboardWelcomeProps {
  user: User | null;
}

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({ user }) => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back{user?.email ? `, ${user.email}` : ''}</p>
    </div>
    <Link href="/upload">
      <Button>
        <FileAudio className="h-4 w-4 mr-2" />
        Upload Audio
      </Button>
    </Link>
  </div>
);

export default DashboardWelcome;