"use client";

import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useLocale } from "../context/LocaleContext";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const [currentLocale, setCurrentLocale] = useState<"en" | "ar">("en");

  useEffect(() => {
    setCurrentLocale(locale as "en" | "ar");
  }, [locale]);

  const handleToggle = () => {
    const newLocale = currentLocale === "en" ? "ar" : "en";
    setLocale(newLocale);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{currentLocale === "en" ? "EN" : "AR"}</span>
      <Switch checked={currentLocale === "ar"} onCheckedChange={handleToggle} />
    </div>
  );
}
