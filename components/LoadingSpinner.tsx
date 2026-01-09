
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Stylizing your image...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-pink-500"></div>
        <p className="text-lg text-gray-300 font-semibold animate-pulse">{message}</p>
        <p className="text-sm text-gray-500">This can take a moment, the AI is getting creative!</p>
    </div>
  );
};
