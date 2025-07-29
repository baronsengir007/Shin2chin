import React from 'react';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { useAppContext } from './contexts/AppContext';

/**
 * Main App Component
 * 
 * Implements minimalist UI principles from User Story #4:
 * - Maximum 3 primary data points visible
 * - ≤4 interactive elements per screen
 * - Only essential information visible
 */
function App() {
  const { state } = useAppContext();

  // Simple page routing based on current page state
  const renderCurrentPage = () => {
    switch (state.currentPage) {
      case 'admin':
        return <Admin />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <Layout>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App; 