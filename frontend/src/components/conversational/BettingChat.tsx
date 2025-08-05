import React, { useState, useRef, useEffect } from 'react';
import { MessageDisplay } from './MessageDisplay';
import { BetProposalExtractor } from './BetProposalExtractor';
import { useWalletConnection } from '../../hooks/store/useWalletConnection';
import { useBetProposals } from '../../hooks/store/useBettingOperations';
import { useToast } from '../../hooks/store/useUIState';

interface Message {
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
}

export const BettingChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connected } = useWalletConnection();
  const { showInfo, showError } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsAnalyzing(true);

    // Simulate bet proposal extraction
    setTimeout(() => {
      const proposalMatch = inputValue.match(/\$?(\d+(?:\.\d+)?)\s*(?:on|for)\s*(.+?)\s*(?:at|with)?\s*(\d+(?:\.\d+)?)?/i);
      
      if (proposalMatch) {
        const proposalMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I detected a betting proposal in your message!',
          sender: 'other',
          timestamp: new Date(),
          hasBetProposal: true,
          proposalData: {
            amount: parseFloat(proposalMatch[1]),
            odds: proposalMatch[3] ? parseFloat(proposalMatch[3]) : 2.0,
            betOn: proposalMatch[2].trim(),
            eventId: 'event-' + Date.now(),
          },
        };
        setMessages(prev => [...prev, proposalMessage]);
        showInfo('Bet proposal detected! Review and confirm to proceed.');
      }
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your wallet to start betting conversations
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Betting Conversations
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Chat naturally about bets - we'll extract the details
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>Start a conversation about betting!</p>
            <p className="text-sm mt-2">
              Example: "I'll bet $50 on the Lakers at 2.5 odds"
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageDisplay key={message.id} message={message} />
          ))
        )}
        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-pulse">Analyzing message...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your betting message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isAnalyzing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isAnalyzing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};