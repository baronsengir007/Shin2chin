import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OddsConfiguration } from '../../../components/events/OddsConfiguration';

// Mock InputValidation
vi.mock('../../../utils/validation/inputValidation', () => ({
  InputValidation: {
    validateOdds: vi.fn((value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 1) {
        return { isValid: false, error: 'Odds must be greater than 1.00' };
      }
      return { isValid: true };
    }),
  },
}));

describe('OddsConfiguration', () => {
  const defaultProps = {
    participants: ['Team A', 'Team B'],
    initialOdds: { 'Team A': 2.0, 'Team B': 2.0 },
    onOddsChange: vi.fn(),
  };

  it('renders odds configuration interface', () => {
    render(<OddsConfiguration {...defaultProps} />);
    
    expect(screen.getByText('Configure Initial Odds')).toBeInTheDocument();
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  it('displays current odds values', () => {
    render(<OddsConfiguration {...defaultProps} />);
    
    const oddsInputs = screen.getAllByDisplayValue('2.00');
    expect(oddsInputs).toHaveLength(2);
  });

  it('calculates implied probabilities correctly', () => {
    render(<OddsConfiguration {...defaultProps} />);
    
    // With odds of 2.0, implied probability should be 50%
    expect(screen.getAllByText('50.0%')).toHaveLength(2);
  });

  it('updates odds when input changes', () => {
    const onOddsChange = vi.fn();
    render(<OddsConfiguration {...defaultProps} onOddsChange={onOddsChange} />);
    
    const firstOddsInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(firstOddsInput, { target: { value: '3.0' } });
    
    expect(onOddsChange).toHaveBeenCalled();
  });

  it('shows auto-balance option for 2-participant events', () => {
    render(<OddsConfiguration {...defaultProps} />);
    
    expect(screen.getByLabelText('Auto-balance odds (for 2-participant events)')).toBeInTheDocument();
  });

  it('auto-balances odds when enabled', () => {
    const onOddsChange = vi.fn();
    render(<OddsConfiguration {...defaultProps} onOddsChange={onOddsChange} />);
    
    const autoBalanceCheckbox = screen.getByLabelText('Auto-balance odds (for 2-participant events)');
    expect(autoBalanceCheckbox).toBeChecked();
    
    const firstOddsInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(firstOddsInput, { target: { value: '1.5' } });
    
    expect(onOddsChange).toHaveBeenCalled();
  });

  it('shows validation errors for invalid odds', () => {
    render(<OddsConfiguration {...defaultProps} />);
    
    const firstOddsInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(firstOddsInput, { target: { value: '0.5' } });
    
    expect(screen.getByText('Odds must be greater than 1.00')).toBeInTheDocument();
  });

  it('resets to even odds', () => {
    const onOddsChange = vi.fn();
    render(<OddsConfiguration {...defaultProps} onOddsChange={onOddsChange} />);
    
    const evenOddsButton = screen.getByText('Even Odds');
    fireEvent.click(evenOddsButton);
    
    expect(onOddsChange).toHaveBeenCalled();
  });

  it('applies preset odds configurations', () => {
    const onOddsChange = vi.fn();
    render(<OddsConfiguration {...defaultProps} onOddsChange={onOddsChange} />);
    
    const favoriteButton = screen.getByText('Favorite Setup');
    fireEvent.click(favoriteButton);
    
    expect(onOddsChange).toHaveBeenCalled();
  });

  it('normalizes odds to proper probability sum', () => {
    const onOddsChange = vi.fn();
    render(<OddsConfiguration {...defaultProps} onOddsChange={onOddsChange} />);
    
    const normalizeButton = screen.getByText('Normalize');
    fireEvent.click(normalizeButton);
    
    expect(onOddsChange).toHaveBeenCalled();
  });

  it('shows odds validity status', () => {
    render(<OddsConfiguration {...defaultProps} />);
    
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('calculates total implied probability', () => {
    render(<OddsConfiguration {...defaultProps} />);
    
    // With two participants at 2.0 odds each: (1/2 + 1/2) * 100 = 100%
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('calculates house edge', () => {
    render(<OddsConfiguration {...defaultProps} />);
    
    // With 100% total probability, house edge should be 0%
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('handles participants list changes', () => {
    const { rerender } = render(<OddsConfiguration {...defaultProps} />);
    
    // Add a third participant
    rerender(
      <OddsConfiguration
        {...defaultProps}
        participants={['Team A', 'Team B', 'Team C']}
      />
    );
    
    expect(screen.getByText('Team C')).toBeInTheDocument();
  });
});