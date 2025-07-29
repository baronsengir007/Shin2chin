import React, { ReactNode } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout Component
 * 
 * Provides consistent minimalist UI structure following User Story #4:
 * - Only essential information visible
 * - ≤4 interactive elements per screen
 * - Clean, distraction-free design
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, dispatch } = useAppContext();

  const handlePageChange = (page: 'home' | 'admin') => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const removeError = (errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: errorId });
  };

  return (
    <div className="layout">
      {/* Header with minimal navigation */}
      <header className="layout-header">
        <h1 className="layout-title">Shin2Chin</h1>
        <nav className="layout-nav">
          <button
            className={`nav-button ${state.currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handlePageChange('home')}
          >
            Bet
          </button>
          <button
            className={`nav-button ${state.currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => handlePageChange('admin')}
          >
            Admin
          </button>
        </nav>
      </header>

      {/* Error display - minimalist and non-intrusive */}
      {state.errors.length > 0 && (
        <div className="error-container">
          {state.errors.map(error => (
            <div key={error.id} className={`error-message ${error.type}`}>
              <span>{error.message}</span>
              <button
                className="error-close"
                onClick={() => removeError(error.id)}
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {state.isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}

      {/* Main content area */}
      <main className="layout-main">
        {children}
      </main>

      {/* Footer with minimal info */}
      <footer className="layout-footer">
        <span>Non-custodial P2P betting on Solana</span>
      </footer>
    </div>
  );
};

export default Layout; 