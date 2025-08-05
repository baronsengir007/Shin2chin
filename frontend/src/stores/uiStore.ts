import { create } from 'zustand';
import { UIStore } from './types';

const useUIStore = create<UIStore>((set) => ({
  currentView: 'home',
  showModal: false,
  modalType: null,
  loading: false,
  error: null,

  setCurrentView: (view) => {
    set({ currentView: view, error: null });
  },

  openModal: (type) => {
    set({ 
      showModal: true, 
      modalType: type,
      error: null 
    });
  },

  closeModal: () => {
    set({ 
      showModal: false, 
      modalType: null,
      error: null 
    });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
    if (error) {
      setTimeout(() => {
        set({ error: null });
      }, 5000);
    }
  },
}));

export default useUIStore;