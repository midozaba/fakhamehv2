import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

const ErrorMessage = ({
  message,
  onRetry,
  type = 'error', // 'error' | 'network' | 'warning'
  fullScreen = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="h-12 w-12 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
      default:
        return <AlertCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      {getIcon()}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {type === 'network' ? 'Network Error' : 'Something went wrong'}
        </h3>
        <p className="text-gray-600">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {content}
    </div>
  );
};

export default ErrorMessage;
