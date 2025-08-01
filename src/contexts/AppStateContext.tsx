import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Deck, Habit } from '../types';

type Screen = 'welcome' | 'onboarding' | 'login' | 'register' | 'main';
type Tab = 'home' | 'flashcards' | 'habits' | 'chat' | 'profile';

interface AppState {
  currentScreen: Screen;
  currentTab: Tab;
  hasSeenOnboarding: boolean;
  flashcardDecks: Deck[];
  habits: Habit[];
  isLoading: Record<string, boolean>;
}

interface AppStateContextType {
  state: AppState;
  setCurrentScreen: (screen: Screen) => void;
  setCurrentTab: (tab: Tab) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setFlashcardDecks: (decks: Deck[]) => void;
  setHabits: (habits: Habit[]) => void;
  setLoading: (key: string, isLoading: boolean) => void;
}

const initialState: AppState = {
  currentScreen: 'welcome',
  currentTab: 'home',
  hasSeenOnboarding: false,
  flashcardDecks: [],
  habits: [],
  isLoading: {}
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, setState] = useState<AppState>(() => {
    // Khởi tạo state từ localStorage nếu có
    if (typeof window !== 'undefined') {
      const onboardingSeen = localStorage.getItem('hasSeenOnboarding') === 'true';
      return {
        ...initialState,
        hasSeenOnboarding: onboardingSeen
      };
    }
    return initialState;
  });

  const setCurrentScreen = (screen: Screen) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  };

  const setCurrentTab = (tab: Tab) => {
    setState(prev => ({ ...prev, currentTab: tab }));
  };

  const setHasSeenOnboarding = (seen: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenOnboarding', seen.toString());
    }
    setState(prev => ({ ...prev, hasSeenOnboarding: seen }));
  };

  const setFlashcardDecks = (decks: Deck[]) => {
    setState(prev => ({ ...prev, flashcardDecks: decks }));
  };

  const setHabits = (habits: Habit[]) => {
    setState(prev => ({ ...prev, habits: habits }));
  };

  const setLoading = (key: string, isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: {
        ...prev.isLoading,
        [key]: isLoading
      }
    }));
  };

  const value = {
    state,
    setCurrentScreen,
    setCurrentTab,
    setHasSeenOnboarding,
    setFlashcardDecks,
    setHabits,
    setLoading
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  
  return context;
}