import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventCreationForm } from '../../../components/events/EventCreationForm';
import * as walletConnectionModule from '../../../hooks/store/useWalletConnection';
import * as uiStateModule from '../../../hooks/store/useUIState';

// Mock dependencies
vi.mock('../../../hooks/store/useWalletConnection');
vi.mock('../../../hooks/store/useUIState');

vi.mock('../../../utils/validation/inputValidation', () => ({
  InputValidation: {
    validateEventTitle: vi.fn((title: string) => {
      if (!title || title.length < 3) {
        return { isValid: false, error: 'Title must be at least 3 characters' };
      }
      return { isValid: true };
    }),
    validateBettingDescription: vi.fn((desc: string) => {
      if (!desc || desc.length < 10) {
        return { isValid: false, error: 'Description must be at least 10 characters' };
      }
      return { isValid: true };
    }),
  },
}));

// Mock child components
vi.mock('../../../components/events/CategorySelector', () => ({
  CategorySelector: ({ onCategoryChange }: any) => (
    <div data-testid="category-selector">
      <button onClick={() => onCategoryChange('Sports')}>Select Sports</button>
    </div>
  ),
}));

vi.mock('../../../components/events/OddsConfiguration', () => ({
  OddsConfiguration: ({ onOddsChange }: any) => (
    <div data-testid="odds-configuration">
      <button onClick={() => onOddsChange({ 'Team A': 2.0, 'Team B': 2.0 })}>
        Set Odds
      </button>
    </div>
  ),
}));

describe('EventCreationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    vi.mocked(walletConnectionModule.useWalletConnection).mockReturnValue({ 
      connected: true 
    });
    
    vi.mocked(uiStateModule.useToast).mockReturnValue({
      showSuccess: vi.fn(),
      showError: vi.fn(),
    });
  });

  it('renders wallet connection prompt when not connected', () => {
    vi.mocked(walletConnectionModule.useWalletConnection).mockReturnValue({ 
      connected: false 
    });

    render(<EventCreationForm />);
    
    expect(screen.getByText('Create New Event')).toBeInTheDocument();
    expect(screen.getByText('Connect your wallet to create betting events')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('renders event creation form when wallet is connected', () => {
    render(<EventCreationForm />);
    
    expect(screen.getByText('Create New Betting Event')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    expect(screen.getByText('Basic Info')).toBeInTheDocument();
  });

  it('shows progress bar with correct step highlighting', () => {
    render(<EventCreationForm />);
    
    const progressSteps = ['Basic Info', 'Participants', 'Odds', 'Review', 'Publish'];
    progressSteps.forEach(step => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('renders basic info form fields', () => {
    render(<EventCreationForm />);
    
    expect(screen.getByText('Event Title *')).toBeInTheDocument();
    expect(screen.getByText('Description *')).toBeInTheDocument();
    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByText('End Time')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Lakers vs Warriors Game 7')).toBeInTheDocument();
  });

  it('updates form state when inputs change', () => {
    render(<EventCreationForm />);
    
    const titleInput = screen.getByPlaceholderText('e.g., Lakers vs Warriors Game 7');
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    
    expect(titleInput).toHaveValue('Test Event');
  });

  it('validates form before proceeding to next step', () => {
    const mockShowError = vi.fn();
    vi.mocked(uiStateModule.useToast).mockReturnValue({ 
      showSuccess: vi.fn(), 
      showError: mockShowError 
    });

    render(<EventCreationForm />);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(mockShowError).toHaveBeenCalledWith('Title must be at least 3 characters');
  });

  it('proceeds to participants step when basic info is valid', () => {
    render(<EventCreationForm />);
    
    // Fill in valid basic info
    const titleInput = screen.getByPlaceholderText('e.g., Lakers vs Warriors Game 7');
    const descInput = screen.getByPlaceholderText('Describe the event and what people will be betting on...');
    
    fireEvent.change(titleInput, { target: { value: 'Valid Event Title' } });
    fireEvent.change(descInput, { target: { value: 'Valid description with enough characters' } });
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('Event Participants')).toBeInTheDocument();
  });

  it('allows adding and removing participants', () => {
    render(<EventCreationForm />);
    
    // Navigate to participants step
    const titleInput = screen.getByPlaceholderText('e.g., Lakers vs Warriors Game 7');
    const descInput = screen.getByPlaceholderText('Describe the event and what people will be betting on...');
    
    fireEvent.change(titleInput, { target: { value: 'Valid Event Title' } });
    fireEvent.change(descInput, { target: { value: 'Valid description with enough characters' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Check initial participants
    const participantInputs = screen.getAllByPlaceholderText(/Option \d+ \(e.g.,/);
    expect(participantInputs).toHaveLength(2);
    
    // Add participant
    const addButton = screen.getByText('Add Another Option');
    fireEvent.click(addButton);
    
    const updatedInputs = screen.getAllByPlaceholderText(/Option \d+ \(e.g.,/);
    expect(updatedInputs).toHaveLength(3);
  });

  it('validates participants before proceeding', () => {
    const mockShowError = vi.fn();
    vi.mocked(uiStateModule.useToast).mockReturnValue({ 
      showSuccess: vi.fn(), 
      showError: mockShowError 
    });

    render(<EventCreationForm />);
    
    // Navigate to participants step with valid basic info
    const titleInput = screen.getByPlaceholderText('e.g., Lakers vs Warriors Game 7');
    const descInput = screen.getByPlaceholderText('Describe the event and what people will be betting on...');
    
    fireEvent.change(titleInput, { target: { value: 'Valid Event Title' } });
    fireEvent.change(descInput, { target: { value: 'Valid description with enough characters' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Try to proceed without filling participants
    fireEvent.click(screen.getByText('Next'));
    
    expect(mockShowError).toHaveBeenCalledWith('At least 2 participants are required');
  });

  it('navigates to odds configuration step', async () => {
    render(<EventCreationForm />);
    
    // Navigate through steps with valid data
    const titleInput = screen.getByPlaceholderText('e.g., Lakers vs Warriors Game 7');
    const descInput = screen.getByPlaceholderText('Describe the event and what people will be betting on...');
    
    fireEvent.change(titleInput, { target: { value: 'Valid Event Title' } });
    fireEvent.change(descInput, { target: { value: 'Valid description with enough characters' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Fill participants
    const participantInputs = screen.getAllByPlaceholderText(/Option \d+ \(e.g.,/);
    fireEvent.change(participantInputs[0], { target: { value: 'Team A' } });
    fireEvent.change(participantInputs[1], { target: { value: 'Team B' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    expect(screen.getByTestId('odds-configuration')).toBeInTheDocument();
  });

  it('shows review step with event summary', async () => {
    render(<EventCreationForm />);
    
    // Navigate through all steps
    const titleInput = screen.getByPlaceholderText('e.g., Lakers vs Warriors Game 7');
    const descInput = screen.getByPlaceholderText('Describe the event and what people will be betting on...');
    
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descInput, { target: { value: 'Test description with enough characters' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Fill participants
    const participantInputs = screen.getAllByPlaceholderText(/Option \d+ \(e.g.,/);
    fireEvent.change(participantInputs[0], { target: { value: 'Team A' } });
    fireEvent.change(participantInputs[1], { target: { value: 'Team B' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Set odds
    const setOddsButton = screen.getByText('Set Odds');
    fireEvent.click(setOddsButton);
    
    fireEvent.click(screen.getByText('Next'));
    
    expect(screen.getByText('Step 4 of 5')).toBeInTheDocument();
    expect(screen.getByText('Review Event Details')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test description with enough characters')).toBeInTheDocument();
  });

  it('publishes event successfully', async () => {
    const mockShowSuccess = vi.fn();
    vi.mocked(uiStateModule.useToast).mockReturnValue({ 
      showSuccess: mockShowSuccess, 
      showError: vi.fn() 
    });

    render(<EventCreationForm />);
    
    // Navigate through all steps
    const titleInput = screen.getByPlaceholderText('e.g., Lakers vs Warriors Game 7');
    const descInput = screen.getByPlaceholderText('Describe the event and what people will be betting on...');
    
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descInput, { target: { value: 'Test description with enough characters' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    const participantInputs = screen.getAllByPlaceholderText(/Option \d+ \(e.g.,/);
    fireEvent.change(participantInputs[0], { target: { value: 'Team A' } });
    fireEvent.change(participantInputs[1], { target: { value: 'Team B' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    const setOddsButton = screen.getByText('Set Odds');
    fireEvent.click(setOddsButton);
    
    fireEvent.click(screen.getByText('Next'));
    
    const publishButton = screen.getByText('Publish Event');
    fireEvent.click(publishButton);
    
    expect(screen.getByText('Publishing Event...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith('Event created successfully!');
    }, { timeout: 3000 });
  });

  it('allows navigation back to previous steps', () => {
    render(<EventCreationForm />);
    
    // Navigate to step 2
    const titleInput = screen.getByPlaceholderText('e.g., Lakers vs Warriors Game 7');
    const descInput = screen.getByPlaceholderText('Describe the event and what people will be betting on...');
    
    fireEvent.change(titleInput, { target: { value: 'Valid Event Title' } });
    fireEvent.change(descInput, { target: { value: 'Valid description with enough characters' } });
    
    fireEvent.click(screen.getByText('Next'));
    
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    
    // Go back to step 1
    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);
    
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('disables previous button on first step', () => {
    render(<EventCreationForm />);
    
    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });
});