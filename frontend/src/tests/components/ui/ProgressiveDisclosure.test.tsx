import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressiveDisclosure } from '../../../components/ui/ProgressiveDisclosure';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('ProgressiveDisclosure', () => {
  const defaultProps = {
    children: (
      <div>
        <div disclosureLevel="basic" disclosureId="basic-section">Basic Content</div>
        <div disclosureLevel="intermediate" disclosureId="intermediate-section" disclosureTitle="Intermediate Options">
          Intermediate Content
        </div>
        <div disclosureLevel="advanced" disclosureId="advanced-section" disclosureTitle="Advanced Settings">
          Advanced Content
        </div>
      </div>
    ),
    advancedMode: false,
    onToggleMode: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('renders simple mode indicator when not in advanced mode', () => {
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    expect(screen.getByText('Simple Mode Active')).toBeInTheDocument();
    expect(screen.getByText('Showing essential features only. Need more options?')).toBeInTheDocument();
    expect(screen.getByText('Show All')).toBeInTheDocument();
  });

  it('does not show mode indicator in advanced mode', () => {
    render(<ProgressiveDisclosure {...defaultProps} advancedMode={true} />);
    
    expect(screen.queryByText('Simple Mode Active')).not.toBeInTheDocument();
  });

  it('shows basic content by default', () => {
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    expect(screen.getByText('Basic Content')).toBeInTheDocument();
  });

  it('hides intermediate content in simple mode', () => {
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    expect(screen.queryByText('Intermediate Content')).not.toBeInTheDocument();
  });

  it('hides advanced content in simple mode', () => {
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    expect(screen.queryByText('Advanced Content')).not.toBeInTheDocument();
  });

  it('shows all content in advanced mode', () => {
    render(<ProgressiveDisclosure {...defaultProps} advancedMode={true} />);
    
    expect(screen.getByText('Basic Content')).toBeInTheDocument();
    expect(screen.getByText('Intermediate Content')).toBeInTheDocument();
    expect(screen.getByText('Advanced Content')).toBeInTheDocument();
  });

  it('calls onToggleMode when Show All button is clicked', () => {
    const onToggleMode = vi.fn();
    render(<ProgressiveDisclosure {...defaultProps} onToggleMode={onToggleMode} />);
    
    const showAllButton = screen.getByText('Show All');
    fireEvent.click(showAllButton);
    
    expect(onToggleMode).toHaveBeenCalled();
  });

  it('loads user experience level from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('intermediate');
    
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('shin2chin-user-level');
  });

  it('shows intermediate content for intermediate users', () => {
    mockLocalStorage.getItem.mockReturnValue('intermediate');
    
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    expect(screen.getByText('Basic Content')).toBeInTheDocument();
    // Intermediate content should be available but collapsed
    expect(screen.getByText('Intermediate Options')).toBeInTheDocument();
  });

  it('shows collapsible sections for intermediate content', () => {
    mockLocalStorage.getItem.mockReturnValue('intermediate');
    
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    // Should show section headers
    expect(screen.getByText('Intermediate Options')).toBeInTheDocument();
    expect(screen.getByText('Additional options')).toBeInTheDocument();
  });

  it('expands collapsible sections when clicked', () => {
    mockLocalStorage.getItem.mockReturnValue('intermediate');
    
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    const sectionButton = screen.getByRole('button', { name: /Intermediate Options/ });
    fireEvent.click(sectionButton);
    
    expect(screen.getByText('Intermediate Content')).toBeInTheDocument();
  });

  it('collapses expanded sections when clicked again', () => {
    mockLocalStorage.getItem.mockReturnValue('intermediate');
    
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    const sectionButton = screen.getByRole('button', { name: /Intermediate Options/ });
    
    // Expand
    fireEvent.click(sectionButton);
    expect(screen.getByText('Intermediate Content')).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(sectionButton);
    expect(screen.queryByText('Intermediate Content')).not.toBeInTheDocument();
  });

  it('shows feature hints for progression', () => {
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    expect(screen.getByText('💡 Getting comfortable?')).toBeInTheDocument();
    expect(screen.getByText('Try intermediate features for more betting options')).toBeInTheDocument();
    expect(screen.getByText('Show More Features')).toBeInTheDocument();
  });

  it('updates user level when feature hint is clicked', () => {
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    const levelUpButton = screen.getByText('Show More Features');
    fireEvent.click(levelUpButton);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('shin2chin-user-level', 'intermediate');
  });

  it('shows different hints for different user levels', () => {
    mockLocalStorage.getItem.mockReturnValue('intermediate');
    
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    expect(screen.getByText('🚀 Ready for advanced tools?')).toBeInTheDocument();
    expect(screen.getByText('Unlock expert features for professional betting')).toBeInTheDocument();
    expect(screen.getByText('Enable Expert Mode')).toBeInTheDocument();
  });

  it('does not show feature hints for expert users', () => {
    mockLocalStorage.getItem.mockReturnValue('expert');
    
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    expect(screen.queryByText('💡 Getting comfortable?')).not.toBeInTheDocument();
    expect(screen.queryByText('🚀 Ready for advanced tools?')).not.toBeInTheDocument();
  });

  it('can dismiss feature hints', () => {
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    const dismissButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(dismissButton);
    
    expect(screen.queryByText('💡 Getting comfortable?')).not.toBeInTheDocument();
  });

  it('applies correct styling to different disclosure levels', () => {
    mockLocalStorage.getItem.mockReturnValue('intermediate');
    
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    const intermediateSection = screen.getByText('Intermediate Options').closest('.border');
    expect(intermediateSection).toHaveClass('border-yellow-200');
  });

  it('shows arrow icons that rotate when sections expand', () => {
    mockLocalStorage.getItem.mockReturnValue('intermediate');
    
    render(<ProgressiveDisclosure {...defaultProps} />);
    
    const sectionButton = screen.getByRole('button', { name: /Intermediate Options/ });
    const arrow = sectionButton.querySelector('svg');
    
    expect(arrow).not.toHaveClass('rotate-180');
    
    fireEvent.click(sectionButton);
    
    expect(arrow).toHaveClass('rotate-180');
  });
});