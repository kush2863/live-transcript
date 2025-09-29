import React from 'react';
import { Card, CardContent } from './card';

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  testId?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({ icon, label, value, testId }) => {
  return (
    <Card className="border border-gray-200" data-testid={testId}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-8 text-gray-600 mb-2 flex items-center justify-center">
              {icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {value ?? 'N/A'}
            </p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricTile;
