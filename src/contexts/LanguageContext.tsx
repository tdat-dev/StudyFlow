import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { detectUserLanguage } from '../utils/languageDetection';

interface LanguageContextType {
  userLanguage: string;
  setUserLanguage: (language: string) => void;
  detectedLanguage?: string;
  setDetectedLanguage: (language: string) => void;
  updateDetectedLanguageFromChat: (
    chatHistory: Array<{ role: 'user' | 'model'; content: string }>,
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [userLanguage, setUserLanguageState] = useState<string>('vi'); // Default Vietnamese
  const [detectedLanguage, setDetectedLanguage] = useState<string>('vi');
  const [isClient, setIsClient] = useState(false);

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user language preference from localStorage
  useEffect(() => {
    if (!isClient) return; // Skip on server side

    try {
      const savedLanguage = localStorage.getItem('userLanguage');
      if (savedLanguage) {
        setUserLanguageState(savedLanguage);
      } else {
        // Detect browser language
        const browserLang = navigator.language.startsWith('en') ? 'en' : 'vi';
        setUserLanguageState(browserLang);
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
    }
  }, [isClient]);

  const setUserLanguage = (language: string) => {
    setUserLanguageState(language);
    if (isClient) {
      try {
        localStorage.setItem('userLanguage', language);
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  };

  const updateDetectedLanguageFromChat = (
    chatHistory: Array<{ role: 'user' | 'model'; content: string }>,
  ) => {
    // Chuyển đổi định dạng để match với detectUserLanguage
    const formattedHistory = chatHistory.map(msg => ({
      content: msg.content,
      sender: msg.role === 'user' ? 'user' : 'assistant',
    }));

    const detected = detectUserLanguage(formattedHistory);
    setDetectedLanguage(detected);
    return detected;
  };

  return (
    <LanguageContext.Provider
      value={{
        userLanguage,
        setUserLanguage,
        detectedLanguage,
        setDetectedLanguage,
        updateDetectedLanguageFromChat,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
