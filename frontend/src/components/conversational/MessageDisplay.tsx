import React from 'react';
import { BetProposal } from './BetProposal';

interface MessageProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'other';
    timestamp: Date;
    hasBetProposal?: boolean;
    proposalData?: {
      amount: number;
      odds: number;
      betOn: string;
      eventId: string;
    };
  };
}

export const MessageDisplay: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`
            px-4 py-2 rounded-lg
            ${isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }
          `}
        >
          <p className="text-sm">{message.text}</p>
          <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        {message.hasBetProposal && message.proposalData && (
          <div className="mt-2">
            <BetProposal proposal={message.proposalData} />
          </div>
        )}
      </div>
    </div>
  );
};