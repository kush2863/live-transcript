"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface JsonPreviewCardProps {
  title: string;
  description: string;
  data: any;
  height?: number;
  actionSlot?: React.ReactNode;
}

export const JsonPreviewCard: React.FC<JsonPreviewCardProps> = ({ title, description, data, height = 96, actionSlot }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {actionSlot}
      </div>
    </CardHeader>
    <CardContent>
      <div className="bg-gray-50 rounded-md p-4 overflow-y-auto" style={{ maxHeight: `${height * 4}px` }}>
        <pre className="text-sm text-gray-900 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </CardContent>
  </Card>
);

export default JsonPreviewCard;