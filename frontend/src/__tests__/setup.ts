import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.solana for tests
Object.defineProperty(window, 'solana', {
  value: undefined,
  writable: true,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Reset all stores before each test
beforeEach(() => {
  // Clear any existing mocks
  vi.clearAllMocks();
  
  // Reset window.solana
  Object.defineProperty(window, 'solana', {
    value: undefined,
    writable: true,
  });
});