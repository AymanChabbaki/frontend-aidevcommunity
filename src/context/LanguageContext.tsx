import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../i18n/en.json';
import frTranslations from '../i18n/fr.json';
import arTranslations from '../i18n/ar.json';

type Language = 'en' | 'fr' | 'ar';
type Translations = typeof enTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Language, Translations> = {
  en: enTranslations,
  fr: frTranslations,
  ar: arTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lock language to English only
  const language: Language = 'en';

  useEffect(() => {
    // Always set to English
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    // Clear any stored language preference
    localStorage.removeItem('language');
  }, []);

  // Keep setLanguage for compatibility but it does nothing
  const setLanguage = (lang: Language) => {
    // Do nothing - language is locked to English
    console.log('Language switching is disabled. Website is English only.');
  };

  const t = translations['en'];
  const dir = 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};