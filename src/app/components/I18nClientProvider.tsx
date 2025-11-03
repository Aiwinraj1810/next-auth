"use client";

import { ReactNode } from "react";
import { I18nProviderClient } from "../i18n";
import { useLocale } from "../context/LocaleContext";

export default function I18nClientProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();

  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>;
}
