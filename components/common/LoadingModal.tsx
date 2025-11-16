import React from 'react';
import Spinner from './Spinner';

interface LoadingModalProps {
  isVisible: boolean;
  title: string;
  message: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isVisible,
  title,
  message
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md text-center shadow-xl">
        <div className="mb-4 flex justify-center">
          <Spinner />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
};