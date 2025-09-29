import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { AudioJobStatus } from '../../lib/types/audio';

interface JobFiltersProps {
  searchTerm: string;
  statusFilter: AudioJobStatus | 'all';
  onSearch: (v: string) => void;
  onStatusChange: (v: AudioJobStatus | 'all') => void;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'transcribing', label: 'Transcribing' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' }
];

const JobFilters: React.FC<JobFiltersProps> = ({ searchTerm, statusFilter, onSearch, onStatusChange }) => (
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by filename..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
    <div className="sm:w-48">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as AudioJobStatus | 'all')}
        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </div>
);

export default JobFilters;
