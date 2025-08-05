import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useUIStore from '../../stores/uiStore';

describe('UIStore Interface Management Tests', () => {
  beforeEach(() => {
    useUIStore.setState({
      currentView: 'home',
      showModal: false,
      modalType: null,
      loading: false,
      error: null,
    });
  });

  test('Initial state verification - Evidence Required', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.currentView).toBe('home');
    expect(result.current.showModal).toBe(false);
    expect(result.current.modalType).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    
    expect(typeof result.current.setCurrentView).toBe('function');
    expect(typeof result.current.openModal).toBe('function');
    expect(typeof result.current.closeModal).toBe('function');
    expect(typeof result.current.setLoading).toBe('function');
    expect(typeof result.current.setError).toBe('function');
  });

  test('View navigation - State Management', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.currentView).toBe('home');

    act(() => {
      result.current.setCurrentView('betting');
    });

    expect(result.current.currentView).toBe('betting');
    expect(result.current.error).toBe(null);

    act(() => {
      result.current.setCurrentView('history');
    });

    expect(result.current.currentView).toBe('history');

    act(() => {
      result.current.setCurrentView('profile');
    });

    expect(result.current.currentView).toBe('profile');
  });

  test('Modal management - Evidence-Based Control', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.showModal).toBe(false);
    expect(result.current.modalType).toBe(null);

    act(() => {
      result.current.openModal('bet-proposal');
    });

    expect(result.current.showModal).toBe(true);
    expect(result.current.modalType).toBe('bet-proposal');
    expect(result.current.error).toBe(null);

    act(() => {
      result.current.openModal('bet-acceptance');
    });

    expect(result.current.showModal).toBe(true);
    expect(result.current.modalType).toBe('bet-acceptance');

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.showModal).toBe(false);
    expect(result.current.modalType).toBe(null);
    expect(result.current.error).toBe(null);
  });

  test('Loading state management - Real State Changes', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.loading).toBe(false);
  });

  test('Error handling - Auto-clear functionality', async () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(result.current.error).toBe(null);

    act(() => {
      result.current.setError('Test error message');
    });

    expect(result.current.error).toBe('Test error message');

    await new Promise(resolve => setTimeout(resolve, 5100));

    expect(result.current.error).toBe(null);
  }, 10000);

  test('Error clearing - Manual and Automatic', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.setError('Manual clear test');
    });

    expect(result.current.error).toBe('Manual clear test');

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBe(null);
  });

  test('State isolation - Independent state changes', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.setCurrentView('betting');
      result.current.openModal('error');
      result.current.setLoading(true);
      result.current.setError('Multiple state test');
    });

    expect(result.current.currentView).toBe('betting');
    expect(result.current.showModal).toBe(true);
    expect(result.current.modalType).toBe('error');
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('Multiple state test');

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.currentView).toBe('betting');
    expect(result.current.showModal).toBe(true);
    expect(result.current.modalType).toBe('error');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Multiple state test');
  });

  test('Modal state reset on view change - State Consistency', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.openModal('bet-proposal');
      result.current.setError('View change test');
    });

    expect(result.current.showModal).toBe(true);
    expect(result.current.error).toBe('View change test');

    act(() => {
      result.current.setCurrentView('history');
    });

    expect(result.current.currentView).toBe('history');
    expect(result.current.error).toBe(null);
    expect(result.current.showModal).toBe(true);
  });

  test('All modal types - Type Safety Verification', () => {
    const { result } = renderHook(() => useUIStore());
    
    const modalTypes: ('bet-proposal' | 'bet-acceptance' | 'error' | null)[] = [
      'bet-proposal',
      'bet-acceptance', 
      'error',
      null
    ];

    modalTypes.forEach(modalType => {
      act(() => {
        result.current.openModal(modalType);
      });

      if (modalType === null) {
        expect(result.current.showModal).toBe(true);
        expect(result.current.modalType).toBe(null);
      } else {
        expect(result.current.showModal).toBe(true);
        expect(result.current.modalType).toBe(modalType);
      }
    });
  });

  test('All view types - Navigation Verification', () => {
    const { result } = renderHook(() => useUIStore());
    
    const viewTypes: ('home' | 'betting' | 'history' | 'profile')[] = [
      'home',
      'betting',
      'history',
      'profile'
    ];

    viewTypes.forEach(viewType => {
      act(() => {
        result.current.setCurrentView(viewType);
      });

      expect(result.current.currentView).toBe(viewType);
    });
  });
});