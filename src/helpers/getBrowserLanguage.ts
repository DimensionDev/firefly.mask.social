import { find } from 'lodash-es';

import { bom } from '@/helpers/bom.js';
import { getLocaleFromCookiesAsync } from '@/helpers/getFromCookies.js';
import { Language } from '@/services/translate.js';

const getBrowserLanguage = () => {
    const browserLanguage = bom.navigator?.language ?? '';
    const browserLanguageLowerCase = browserLanguage.toLowerCase();
    // corner case: zh-cn to Chinese_Simplified
    if (browserLanguageLowerCase === 'zh-cn') return Language.Chinese_Simplified;
    // corner case: zh-tw to Chinese_Traditional
    if (browserLanguageLowerCase === 'zh-tw') return Language.Chinese_Traditional;
    const matched = find(Object.values(Language), (lang) => browserLanguageLowerCase.startsWith(lang.toLowerCase()));
    // Use browser language if it's not matched with any of the supported languages
    return matched ?? (browserLanguage as Language);
};

const isSameLanguageWithBrowser = (locale: string) => {
    const browserLanguage = getBrowserLanguage();
    const browserLanguageLowerCase = browserLanguage.toLowerCase();
    const localLowerCase = locale.toLowerCase();
    return browserLanguageLowerCase.startsWith(localLowerCase);
};

export const getTargetLanguage = async (locale: string) => {
    const appLocale = await getLocaleFromCookiesAsync();
    if (!locale || locale === 'N/A') return null;
    if (locale !== appLocale) return appLocale as unknown as Language;
    if (!isSameLanguageWithBrowser(locale)) return getBrowserLanguage();
    return null;
};
