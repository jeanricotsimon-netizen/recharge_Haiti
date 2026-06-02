import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Detect language based on browser settings and country
const detectLanguage = (): Language => {
  // Get browser language
  const browserLang = navigator.language.toLowerCase();

  // Check for specific language codes
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('ht')) return 'ht';
  if (browserLang.startsWith('en')) return 'en';

  // Try to detect by region
  if (browserLang.includes('br')) return 'pt';
  if (browserLang.includes('mx') || browserLang.includes('ar') || browserLang.includes('co')) return 'es';
  if (browserLang.includes('ht')) return 'ht';

  // Default to English
  return 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get saved language from localStorage
    const saved = localStorage.getItem('app-language') as Language;
    if (saved && translations[saved]) {
      return saved;
    }
    // Otherwise, detect from browser
    return detectLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
