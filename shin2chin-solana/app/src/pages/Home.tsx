import React from 'react';
import Gary from '../components/Gary/Gary';
import './Home.css';

/**
 * Home Page Component
 * 
 * Hosts the Gary AI conversational interface for User Story #1:
 * "As a crypto-native sports fan, I want to place simple binary bets through 
 * natural conversation so that I can express my sports knowledge without 
 * navigating complex betting interfaces."
 * 
 * Implements minimalist UI principles from User Story #4:
 * - Only essential information visible
 * - ≤4 interactive elements per screen
 */
const Home: React.FC = () => {
  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <h2>Place Your Bet</h2>
          <p>Chat with Gary to place simple binary bets on upcoming matches</p>
        </div>
        
        <div className="gary-container">
          <Gary />
        </div>
      </div>
    </div>
  );
};

export default Home; 