import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MinimalLayout } from '../../../components/ui/MinimalLayout';
import * as walletConnectionModule from '../../../hooks/store/useWalletConnection';
import * as uiStateModule from '../../../hooks/store/useUIState';

// Mock dependencies
vi.mock('../../../hooks/store/useUIState', () => ({
  useCurrentView: vi.fn(() => ({
    currentView: 'betting-chat',
  })),
}));

vi.mock('../../../hooks/store/useWalletConnection', () => ({
  useWalletConnection: vi.fn(() => ({
    connected: true,
    balance: 1500000000, // 1.5 SOL in lamports
  })),
}));

vi.mock('../../../components/ui/ProgressiveDisclosure', () => ({
  ProgressiveDisclosure: ({ children, advancedMode, onToggleMode }: any) => (
    <div data-testid="progressive-disclosure">
      <div data-testid="advanced-mode">{advancedMode.toString()}</div>
      <button onClick={onToggleMode} data-testid="toggle-mode">Toggle Mode</button>
      {children}
    </div>
  ),
}));

describe('MinimalLayout', () => {
  const defaultProps = {
    children: <div>Test Content</div>,
  };

  it('renders minimal layout structure', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });

  it('displays view title from current view', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    expect(screen.getByText('Chat & Bet')).toBeInTheDocument();
  });

  it('displays custom title when provided', () => {
    render(<MinimalLayout {...defaultProps} title="Custom Title" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('shows wallet connection status when connected', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    expect(screen.getByText('1.50 SOL')).toBeInTheDocument();
    
    // Should show green connection indicator
    const indicator = document.querySelector('.bg-green-500');
    expect(indicator).toBeInTheDocument();
  });

  it('handles disconnected wallet state', () => {
    vi.mocked(walletConnectionModule.useWalletConnection).mockReturnValue({
      connected: false,
      balance: null,
    });

    render(<MinimalLayout {...defaultProps} />);
    
    expect(screen.queryByText(/SOL/)).not.toBeInTheDocument();
  });

  it('shows connected status when balance is null', () => {
    vi.mocked(walletConnectionModule.useWalletConnection).mockReturnValue({
      connected: true,
      balance: null,
    });

    render(<MinimalLayout {...defaultProps} />);
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('initializes with showAdvanced prop', () => {
    render(<MinimalLayout {...defaultProps} showAdvanced={true} />);
    
    expect(screen.getByTestId('advanced-mode')).toHaveTextContent('true');
  });

  it('toggles advanced mode when button is clicked', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    // Should start in simple mode
    expect(screen.getByTestId('advanced-mode')).toHaveTextContent('false');
    
    const toggleButton = screen.getByTitle(/Switch to Advanced Mode/);
    fireEvent.click(toggleButton);
    
    expect(screen.getByTestId('advanced-mode')).toHaveTextContent('true');
  });

  it('shows correct icon for simple mode', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    const toggleButton = screen.getByTitle(/Switch to Advanced Mode/);
    const icon = toggleButton.querySelector('svg path');
    expect(icon).toHaveAttribute('d', 'M12 6v6m0 0v6m0-6h6m-6 0H6'); // Plus icon
  });

  it('shows correct icon for advanced mode', () => {
    render(<MinimalLayout {...defaultProps} showAdvanced={true} />);
    
    const toggleButton = screen.getByTitle(/Switch to Simple Mode/);
    const icon = toggleButton.querySelector('svg path');
    expect(icon).toHaveAttribute('d', 'M20 12H4'); // Minus icon
  });

  it('passes advancedMode to ProgressiveDisclosure', () => {
    render(<MinimalLayout {...defaultProps} showAdvanced={true} />);
    
    expect(screen.getByTestId('advanced-mode')).toHaveTextContent('true');
  });

  it('passes onToggleMode to ProgressiveDisclosure', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    const progressiveToggle = screen.getByTestId('toggle-mode');
    fireEvent.click(progressiveToggle);
    
    expect(screen.getByTestId('advanced-mode')).toHaveTextContent('true');
  });

  it('renders children within ProgressiveDisclosure', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('progressive-disclosure')).toContainElement(
      screen.getByText('Test Content')
    );
  });

  it('shows simple mode footer in simple mode', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    expect(screen.getByText('Simple mode •')).toBeInTheDocument();
    expect(screen.getByText('Show more options')).toBeInTheDocument();
  });

  it('hides simple mode footer in advanced mode', () => {
    render(<MinimalLayout {...defaultProps} showAdvanced={true} />);
    
    expect(screen.queryByText('Simple mode •')).not.toBeInTheDocument();
  });

  it('toggles mode when footer link is clicked', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    const footerToggle = screen.getByText('Show more options');
    fireEvent.click(footerToggle);
    
    expect(screen.getByTestId('advanced-mode')).toHaveTextContent('true');
  });

  it('maps view names to titles correctly', () => {
    const testCases = [
      { view: 'betting-chat', title: 'Chat & Bet' },
      { view: 'live-events', title: 'Live Events' },
      { view: 'p2p-betting', title: 'P2P Betting' },
      { view: 'create-event', title: 'Create Event' },
      { view: 'my-bets', title: 'My Bets' },
      { view: 'unknown-view', title: 'Betting Platform' },
    ];

    testCases.forEach(({ view, title }) => {
      vi.mocked(uiStateModule.useCurrentView).mockReturnValue({ currentView: view });

      const { unmount } = render(<MinimalLayout {...defaultProps} />);
      expect(screen.getByText(title)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies responsive layout classes', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    const header = screen.getByRole('banner');
    expect(header.querySelector('.max-w-4xl')).toBeInTheDocument();
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-4xl', 'mx-auto', 'px-4', 'py-6');
  });

  it('applies dark mode classes', () => {
    render(<MinimalLayout {...defaultProps} />);
    
    const container = screen.getByRole('banner').closest('div');
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-gray-900');
  });

  it('formats balance correctly', () => {
    const testCases = [
      { balance: 1000000000, expected: '1.00 SOL' }, // 1 SOL
      { balance: 1500000000, expected: '1.50 SOL' }, // 1.5 SOL
      { balance: 123456789, expected: '0.12 SOL' }, // 0.123... SOL rounded to 2 decimals
    ];

    testCases.forEach(({ balance, expected }) => {
      vi.mocked(walletConnectionModule.useWalletConnection).mockReturnValue({
        connected: true,
        balance,
      });

      const { unmount } = render(<MinimalLayout {...defaultProps} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });
});