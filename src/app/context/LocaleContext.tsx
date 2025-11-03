"use client";

import { createContext, useContext, useEffect, useState } from "react";

type LocaleContextType = {
  locale: string;
  setLocale: (locale: string) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") || "en";
    setLocale(saved);
    // document.dir = saved === "ar" ? "rtl" : "ltr";
  }, []);

  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    // document.dir = newLocale === "ar" ? "rtl" : "ltr";
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
