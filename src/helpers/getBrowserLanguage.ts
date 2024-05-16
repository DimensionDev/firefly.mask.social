import type { Language } from "@/constants/enum.js";

export const getBrowserLanguage = () => {
  return navigator.language as unknown as Language;
}

export const isSameLanguageWithBrowser = (local: string) => {
  const browserLanguage = getBrowserLanguage();
  const browserLanguageLowerCase = browserLanguage.toLowerCase();
  const localLowerCase = local.toLowerCase();
  return browserLanguageLowerCase.startsWith(localLowerCase)
}
