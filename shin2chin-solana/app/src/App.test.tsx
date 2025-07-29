import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AppProvider } from './contexts/AppContext';

// Mock the components that will be integrated later
jest.mock('./components/Layout/Layout', () => {
  return function MockLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

jest.mock('./pages/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('./pages/Admin', () => {
  return function MockAdmin() {
    return <div data-testid="admin-page">Admin Page</div>;
  };
});

// Test wrapper with context provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AppProvider>{children}</AppProvider>;
};

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders home page by default', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
}); 