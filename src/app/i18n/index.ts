
import { createI18nClient } from "next-international/client";

export const { useI18n, useScopedI18n, I18nProviderClient } = createI18nClient({
  en: () => import("../locales/translations/en"),
  ar: () => import("../locales/translations/ar"),
});
