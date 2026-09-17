import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, TranslationSchema } from './translations';
import { ALL_SUPPORTED_LANGUAGES } from '../types';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: keyof TranslationSchema) => string;
  currentLanguageMeta: {
    code: string;
    label: string;
    nativeName: string;
  };
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLanguage,
  onLanguageChange
}) => {
  const [language, setLanguageState] = useState<string>(() => {
    if (initialLanguage && translations[initialLanguage]) {
      return initialLanguage;
    }
    const saved = localStorage.getItem('craftwise_lang');
    if (saved && translations[saved]) {
      return saved;
    }
    return 'te'; // Telugu default for Andhra Pradesh craft artisans
  });

  useEffect(() => {
    if (initialLanguage && translations[initialLanguage] && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  const setLanguage = (newLang: string) => {
    if (translations[newLang]) {
      setLanguageState(newLang);
      localStorage.setItem('craftwise_lang', newLang);
      if (onLanguageChange) {
        onLanguageChange(newLang);
      }
    }
  };

  const t = (key: keyof TranslationSchema): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return key;
  };

  const currentLanguageMeta = ALL_SUPPORTED_LANGUAGES.find((l) => l.code === language) || {
    code: 'te',
    label: 'Telugu',
    nativeName: 'తెలుగు'
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, currentLanguageMeta }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      language: 'te',
      setLanguage: () => {},
      t: (key: keyof TranslationSchema) => (translations.te && translations.te[key]) || key,
      currentLanguageMeta: { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' }
    };
  }
  return context;
};
