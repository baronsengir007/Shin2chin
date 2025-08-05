import { useCallback } from 'react';
import { useUIStore } from '../../stores/uiStore';

export const useCurrentView = () => {
  const currentView = useUIStore((state) => state.currentView);
  const setCurrentView = useUIStore((state) => state.setCurrentView);

  const navigateTo = useCallback((view: string) => {
    setCurrentView(view);
  }, [setCurrentView]);

  return {
    currentView,
    navigateTo,
    isActive: (view: string) => currentView === view,
  };
};

export const useErrorHandler = () => {
  const error = useUIStore((state) => state.error);
  const setError = useUIStore((state) => state.setError);
  const clearError = useUIStore((state) => state.clearError);

  const handleError = useCallback((message: string, error?: Error) => {
    console.error(message, error);
    setError(message, error);
  }, [setError]);

  return {
    error,
    errorMessage: error?.message,
    errorDetails: error?.details,
    handleError,
    clearError,
    hasError: error !== null,
  };
};

export const useLoadingStates = () => {
  const loadingStates = useUIStore((state) => state.loadingStates);
  const setLoading = useUIStore((state) => state.setLoading);

  const isLoading = useCallback((key: string) => {
    return loadingStates.get(key) || false;
  }, [loadingStates]);

  const isAnyLoading = loadingStates.size > 0 && 
    Array.from(loadingStates.values()).some(state => state);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
  };
};

export const useModal = () => {
  const activeModal = useUIStore((state) => state.activeModal);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  const isOpen = useCallback((modalId: string) => {
    return activeModal === modalId;
  }, [activeModal]);

  return {
    activeModal,
    openModal,
    closeModal,
    isOpen,
    isModalOpen: activeModal !== null,
  };
};

export const useToast = () => {
  const toasts = useUIStore((state) => state.toasts);
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  const showSuccess = useCallback((message: string) => {
    addToast({
      id: Date.now().toString(),
      message,
      type: 'success',
    });
  }, [addToast]);

  const showError = useCallback((message: string) => {
    addToast({
      id: Date.now().toString(),
      message,
      type: 'error',
    });
  }, [addToast]);

  const showInfo = useCallback((message: string) => {
    addToast({
      id: Date.now().toString(),
      message,
      type: 'info',
    });
  }, [addToast]);

  return {
    toasts,
    showSuccess,
    showError,
    showInfo,
    removeToast,
  };
};