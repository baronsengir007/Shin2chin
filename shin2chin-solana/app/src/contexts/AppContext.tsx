import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types for app state
export interface User {
  id?: string;
  walletAddress?: string;
  isConnected: boolean;
}

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
}

export interface AppState {
  user: User;
  errors: AppError[];
  isLoading: boolean;
  currentPage: 'home' | 'admin';
}

// Action types for state management
type AppAction =
  | { type: 'SET_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_ERROR'; payload: Omit<AppError, 'id' | 'timestamp'> }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'SET_PAGE'; payload: 'home' | 'admin' };

// Initial state
const initialState: AppState = {
  user: {
    isConnected: false,
  },
  errors: [],
  isLoading: false,
  currentPage: 'home',
};

// Reducer for state management
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [
          ...state.errors,
          {
            ...action.payload,
            id: Date.now().toString(),
            timestamp: new Date(),
          },
        ],
      };
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      };
    default:
      return state;
  }
}

// Context creation
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook for using the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 