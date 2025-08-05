import React, { useState, useEffect } from 'react';
import { useTransactionStatus } from '../../hooks/store/useBlockchainData';
import { useToast } from '../../hooks/store/useUIState';

interface TransactionFlowProps {
  signature: string | null;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export const TransactionFlow: React.FC<TransactionFlowProps> = ({
  signature,
  onComplete,
  onError,
}) => {
  const status = useTransactionStatus(signature);
  const { showSuccess, showError } = useToast();
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    if (status === 'confirmed' && !hasNotified) {
      showSuccess('Transaction confirmed!');
      onComplete?.();
      setHasNotified(true);
    } else if (status === 'failed' && !hasNotified) {
      showError('Transaction failed');
      onError?.('Transaction failed');
      setHasNotified(true);
    }
  }, [status, hasNotified, showSuccess, showError, onComplete, onError]);

  if (!signature) {
    return null;
  }

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'confirmed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'confirmed':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Transaction submitted and pending confirmation...';
      case 'confirmed':
        return 'Transaction confirmed successfully!';
      case 'failed':
        return 'Transaction failed. Please try again.';
      default:
        return 'Processing transaction...';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Transaction Status
        </h3>
      </div>

      <div className="space-y-3">
        <p className={`text-sm ${getStatusColor()}`}>
          {getStatusMessage()}
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Transaction Signature:
          </p>
          <code className="text-xs font-mono text-gray-900 dark:text-white break-all">
            {signature}
          </code>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => window.open(
              `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
              '_blank'
            )}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            View on Explorer
          </button>
          
          {status === 'confirmed' && (
            <button
              onClick={onComplete}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Continue
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Submitted</span>
            <span>Processing</span>
            <span>Confirmed</span>
          </div>
          <div className="flex space-x-1">
            <div className="flex-1 h-2 bg-green-500 rounded"></div>
            <div className={`flex-1 h-2 rounded ${
              status === 'pending' ? 'bg-yellow-500' : 
              status === 'confirmed' ? 'bg-green-500' : 
              status === 'failed' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}></div>
            <div className={`flex-1 h-2 rounded ${
              status === 'confirmed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};