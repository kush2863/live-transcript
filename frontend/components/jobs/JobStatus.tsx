import React from 'react';
import { FileAudio, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { AudioJobStatus } from '../../lib/types/audio';

export const statusIcon = (status: AudioJobStatus, className = 'h-4 w-4') => {
  switch (status) {
    case 'completed':
      return <CheckCircle className={`${className} text-green-600`} />;
    case 'transcribing':
    case 'analyzing':
      return <Clock className={`${className} text-blue-600`} />;
    case 'failed':
      return <AlertCircle className={`${className} text-red-600`} />;
    default:
      return <FileAudio className={`${className} text-gray-600`} />;
  }
};

export const statusText = (status: AudioJobStatus) => {
  switch (status) {
    case 'uploaded':
      return 'Uploaded';
    case 'transcribing':
      return 'Transcribing...';
    case 'analyzing':
      return 'Analyzing...';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
};

export const statusBadgeColor = (status: AudioJobStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'transcribing':
    case 'analyzing':
      return 'bg-blue-100 text-blue-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface StatusBadgeProps { status: AudioJobStatus; className?: string; }
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className='' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadgeColor(status)} ${className}`}>
    {statusText(status)}
  </span>
);

export default StatusBadge;
