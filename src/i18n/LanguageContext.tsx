import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)[Language];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectLanguage(): Language {
  const stored = localStorage.getItem("kb-language") as Language | null;
  if (stored && ["pt", "en", "es"].includes(stored)) return stored;

  const browserLang = navigator.language.slice(0, 2);
  if (browserLang === "pt") return "pt";
  if (browserLang === "es") return "es";
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("kb-language", lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
