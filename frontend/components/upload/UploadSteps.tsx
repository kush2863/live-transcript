"use client";
import React from 'react';
import { Card } from '@/components/ui/card';

export const UploadSteps: React.FC = () => (
  <div className="mt-12 grid md:grid-cols-3 gap-6">
    {[
      { step: 1, title: 'Upload', desc: 'Upload your audio file (MP3, WAV, M4A)' },
      { step: 2, title: 'Process', desc: 'AI transcribes and identifies speakers' },
      { step: 3, title: 'Analyze', desc: 'Generate professional conversation report' }
    ].map(s => (
      <Card key={s.step} className="p-6 text-center">
        <div className="text-2xl font-bold text-blue-600 mb-2">{s.step}</div>
        <h3 className="font-semibold mb-2">{s.title}</h3>
        <p className="text-sm text-gray-600">{s.desc}</p>
      </Card>
    ))}
  </div>
);

export default UploadSteps;