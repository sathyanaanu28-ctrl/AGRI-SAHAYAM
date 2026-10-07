import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/languages';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('agrisahay_lang');
    if (saved) {
      const found = SUPPORTED_LANGUAGES.find((l) => l.code === saved);
      if (found) return found;
    }
    return SUPPORTED_LANGUAGES[0];
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agrisahay_lang', lang.code);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language.code] || TRANSLATIONS.en;
    let text = langDict[key] || TRANSLATIONS.en[key] || key;

    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
