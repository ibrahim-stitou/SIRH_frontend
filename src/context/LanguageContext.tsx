'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import CreativeLoader from '@/components/custom/loader';

type Translations = Record<string, any>;

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  isLoading: boolean;
  handleLanguageChange: (lang: string) => void;
  isRTL: boolean; // added
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {

  const [language, setLanguage] = useState('fr');
  const [translations, setTranslations] = useState<Record<string, Translations>>({});
  const [isLoading, setIsLoading] = useState(true);
  const isRTL = language === 'ar';

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('locale', lang);
  };

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      setLanguage(savedLocale);
    }

    const loadAllTranslations = async () => {
      setIsLoading(true);
      try {
        const availableLanguages = ['en', 'ar','fr'];

        const translationPromises = availableLanguages.map(async (lang) => {
          const response = await fetch(`/locales/${lang}.json`);
          const data = await response.json();
          return { lang, data };
        });

        const loadedTranslations = (await Promise.all(translationPromises)).reduce(
          (acc, { lang, data }) => {
            acc[lang] = data;
            return acc;
          },
          {} as Record<string, Translations>
        );

        setTranslations(loadedTranslations);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllTranslations();
  }, []);

  useEffect(() => {
    // apply dir and class whenever language changes
    const root = document.documentElement;
    if (language === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.classList.add('rtl');
    } else {
      root.setAttribute('dir', 'ltr');
      root.classList.remove('rtl');
    }
  }, [language]);

  const t = (key: string): string => {
    if (!translations[language]) return key;

    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading, handleLanguageChange, isRTL }}>
      {isLoading ? <CreativeLoader /> : children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}