import React, { useState, useEffect, useRef } from 'react';
import { useGaryAI } from '../../services/ai/gary';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBettingProgram } from '../../services/program/betting';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

/**
 * Gary - AI-powered conversational betting interface
 * 
 * This component implements User Story #1:
 * "As a crypto-native sports fan, I want to place simple binary bets through 
 * natural conversation so that I can express my sports knowledge without 
 * navigating complex betting interfaces."
 */
const Gary: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isBetting, setIsBetting] = useState<boolean>(false);
  const [pendingBet, setPendingBet] = useState<any>(null);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const wallet = useWallet();
  const { placeBet } = useBettingProgram();
  const { processMessage, getBettingIntent } = useGaryAI();

  // Initial greeting on component mount
  useEffect(() => {
    addMessage({
      id: 'welcome',
      text: "Hi there! I'm Gary. Want to place a bet on any upcoming matches?",
      isUser: false,
      timestamp: new Date()
    });
  }, []);

  // Auto-scroll to the most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    addMessage(userMessage);
    setInput('');

    // If we're waiting for bet confirmation
    if (isBetting && pendingBet) {
      if (input.toLowerCase().includes('yes')) {
        try {
          // User confirmed the bet
          addMessage({
            id: Date.now().toString(),
            text: "Processing your bet...",
            isUser: false,
            timestamp: new Date()
          });
          
          await placeBet(pendingBet);
          
          addMessage({
            id: Date.now().toString(),
            text: "Your bet has been placed! I'll let you know the outcome after the match.",
            isUser: false,
            timestamp: new Date()
          });
        } catch (error) {
          addMessage({
            id: Date.now().toString(),
            text: `Sorry, there was an error placing your bet: ${error}`,
            isUser: false,
            timestamp: new Date()
          });
        }
        setIsBetting(false);
        setPendingBet(null);
      } else {
        // User rejected the bet
        addMessage({
          id: Date.now().toString(),
          text: "No problem! Let me know if you want to place a different bet.",
          isUser: false,
          timestamp: new Date()
        });
        setIsBetting(false);
        setPendingBet(null);
      }
      return;
    }

    // Regular conversation flow
    try {
      // Process user input with Gary AI
      const aiResponse = await processMessage(input);
      
      // Check if user intended to place a bet
      const bettingIntent = await getBettingIntent(input);
      
      if (bettingIntent) {
        // User wants to place a bet
        setIsBetting(true);
        setPendingBet(bettingIntent);
        
        // Betting confirmation message (User Story #3 requirement)
        addMessage({
          id: Date.now().toString(),
          text: `I understand you want to bet ${bettingIntent.amount} on ${bettingIntent.team}. If they win, you'll take both stakes. Do you want to proceed? Please respond with 'Yes' to confirm.`,
          isUser: false,
          timestamp: new Date()
        });
      } else {
        // Regular conversation response
        addMessage({
          id: Date.now().toString(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date()
        });
      }
    } catch (error) {
      addMessage({
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble understanding. Could you rephrase that?",
        isUser: false,
        timestamp: new Date()
      });
    }
  };

  return (
    <div className="gary-container">
      <div className="gary-messages">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.isUser ? 'user-message' : 'gary-message'}`}
          >
            {!msg.isUser && <div className="gary-avatar">G</div>}
            <div className="message-text">{msg.text}</div>
            {msg.isUser && <div className="user-avatar">U</div>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="gary-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={!wallet.connected}
        />
        <button type="submit" disabled={!wallet.connected}>
          Send
        </button>
      </form>
      
      {!wallet.connected && (
        <div className="wallet-notice">
          Connect your wallet to start betting
        </div>
      )}
    </div>
  );
};

export default Gary;