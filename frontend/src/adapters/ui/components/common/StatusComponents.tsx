import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      />
      {message && <p className="mt-2 text-sm text-gray-500">{message}</p>}
    </div>
  );
};

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="text-danger-500 text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-danger-700 font-medium">Error</p>
          <p className="text-danger-600 text-sm">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-danger-100 text-danger-700 rounded hover:bg-danger-200 transition-colors text-sm"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CLOSED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    COMPLIANT: 'bg-success-100 text-success-700 border-success-200',
    NON_COMPLIANT: 'bg-danger-100 text-danger-700 border-danger-200',
    PENDING: 'bg-warning-100 text-warning-700 border-warning-200',
    ACTIVE: 'bg-success-100 text-success-700 border-success-200',
    USED: 'bg-gray-100 text-gray-700 border-gray-200',
    EXPIRED: 'bg-danger-100 text-danger-700 border-danger-200',
    CLOSED: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
