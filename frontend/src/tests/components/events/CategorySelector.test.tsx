import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategorySelector } from '../../../components/events/CategorySelector';

describe('CategorySelector', () => {
  const defaultProps = {
    selectedCategory: 'Sports',
    onCategoryChange: vi.fn(),
  };

  it('renders category selector interface', () => {
    render(<CategorySelector {...defaultProps} />);
    
    expect(screen.getByText('Event Category *')).toBeInTheDocument();
    expect(screen.getAllByText('Sports')).toHaveLength(2); // Selected category display + button
  });

  it('displays selected category with proper styling', () => {
    render(<CategorySelector {...defaultProps} />);
    
    const selectedCategory = screen.getAllByText('Sports')[0]; // First instance is the selected display
    expect(selectedCategory.closest('div')).toHaveClass('inline-flex');
  });

  it('shows all main categories', () => {
    render(<CategorySelector {...defaultProps} />);
    
    expect(screen.getAllByText('Sports')).toHaveLength(2);
    expect(screen.getByText('Crypto')).toBeInTheDocument();
    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('displays category icons', () => {
    render(<CategorySelector {...defaultProps} />);
    
    // Check for emojis in the UI - using getAllByText since icons appear multiple times
    expect(screen.getAllByText('⚽')).toHaveLength(2); // Selected display + button
    expect(screen.getByText('₿')).toBeInTheDocument();
    expect(screen.getByText('🗳️')).toBeInTheDocument();
  });

  it('shows subcategory count for each category', () => {
    render(<CategorySelector {...defaultProps} />);
    
    expect(screen.getAllByText('6 options')).toHaveLength(2); // Sports and Crypto both have 6 subcategories
    expect(screen.getAllByText('4 options')).toHaveLength(2); // Politics and Technology both have 4
    expect(screen.getByText('3 options')).toBeInTheDocument(); // Weather
    expect(screen.getByText('1 options')).toBeInTheDocument(); // Other
  });

  it('opens subcategories when main category is clicked', () => {
    render(<CategorySelector {...defaultProps} />);
    
    // Find the Sports button in the grid (not the selected category display)
    const categoryButtons = screen.getAllByRole('button');
    const sportsButton = categoryButtons.find(button => 
      button.textContent?.includes('Sports') && button.textContent?.includes('6 options')
    );
    
    if (sportsButton) {
      fireEvent.click(sportsButton);
      
      expect(screen.getByText('Choose Sports Subcategory:')).toBeInTheDocument();
      expect(screen.getByText('Basketball')).toBeInTheDocument();
      expect(screen.getByText('Soccer')).toBeInTheDocument();
    }
  });

  it('calls onCategoryChange when subcategory is selected', () => {
    const onCategoryChange = vi.fn();
    render(<CategorySelector {...defaultProps} onCategoryChange={onCategoryChange} />);
    
    // Click Sports to open subcategories
    const categoryButtons = screen.getAllByRole('button');
    const sportsButton = categoryButtons.find(button => 
      button.textContent?.includes('Sports') && button.textContent?.includes('6 options')
    );
    
    if (sportsButton) {
      fireEvent.click(sportsButton);
      
      // Click Basketball subcategory
      const basketballButton = screen.getByText('Basketball');
      fireEvent.click(basketballButton);
      
      expect(onCategoryChange).toHaveBeenCalledWith('Basketball');
    }
  });

  it('closes subcategories after selection', () => {
    render(<CategorySelector {...defaultProps} />);
    
    // Open subcategories
    const categoryButtons = screen.getAllByRole('button');
    const sportsButton = categoryButtons.find(button => 
      button.textContent?.includes('Sports') && button.textContent?.includes('6 options')
    );
    
    if (sportsButton) {
      fireEvent.click(sportsButton);
      
      // Select subcategory
      const basketballButton = screen.getByText('Basketball');
      fireEvent.click(basketballButton);
      
      // Subcategories should be closed
      expect(screen.queryByText('Choose Sports Subcategory:')).not.toBeInTheDocument();
    }
  });

  it('shows back button in subcategory view', () => {
    render(<CategorySelector {...defaultProps} />);
    
    const categoryButtons = screen.getAllByRole('button');
    const sportsButton = categoryButtons.find(button => 
      button.textContent?.includes('Sports') && button.textContent?.includes('6 options')
    );
    
    if (sportsButton) {
      fireEvent.click(sportsButton);
      expect(screen.getByText('← Back to categories')).toBeInTheDocument();
    }
  });

  it('closes subcategories when back button is clicked', () => {
    render(<CategorySelector {...defaultProps} />);
    
    // Open subcategories
    const categoryButtons = screen.getAllByRole('button');
    const sportsButton = categoryButtons.find(button => 
      button.textContent?.includes('Sports') && button.textContent?.includes('6 options')
    );
    
    if (sportsButton) {
      fireEvent.click(sportsButton);
      
      // Click back button
      const backButton = screen.getByText('← Back to categories');
      fireEvent.click(backButton);
      
      expect(screen.queryByText('Choose Sports Subcategory:')).not.toBeInTheDocument();
    }
  });

  it('displays popular categories quick select', () => {
    render(<CategorySelector {...defaultProps} />);
    
    expect(screen.getByText('Popular categories:')).toBeInTheDocument();
    expect(screen.getByText('Basketball')).toBeInTheDocument();
    expect(screen.getByText('Soccer')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Elections')).toBeInTheDocument();
    expect(screen.getByText('Movies')).toBeInTheDocument();
  });

  it('calls onCategoryChange when popular category is selected', () => {
    const onCategoryChange = vi.fn();
    render(<CategorySelector {...defaultProps} onCategoryChange={onCategoryChange} />);
    
    const bitcoinButton = screen.getByRole('button', { name: 'Bitcoin' });
    fireEvent.click(bitcoinButton);
    
    expect(onCategoryChange).toHaveBeenCalledWith('Bitcoin');
  });

  it('highlights selected category in popular list', () => {
    render(<CategorySelector {...defaultProps} selectedCategory="Basketball" />);
    
    const basketballButton = screen.getByRole('button', { name: 'Basketball' });
    expect(basketballButton).toHaveClass('bg-blue-600');
  });

  it('highlights selected main category', () => {
    render(<CategorySelector {...defaultProps} selectedCategory="Sports" />);
    
    const categoryButtons = screen.getAllByRole('button');
    const sportsButton = categoryButtons.find(button => 
      button.textContent?.includes('Sports') && button.textContent?.includes('6 options')
    );
    
    if (sportsButton) {
      expect(sportsButton).toHaveClass('border-blue-500');
    }
  });

  it('detects parent category for subcategory selection', () => {
    render(<CategorySelector {...defaultProps} selectedCategory="Basketball" />);
    
    // Should show Basketball as selected even though it's a subcategory
    expect(screen.getByText('Basketball')).toBeInTheDocument();
  });
});