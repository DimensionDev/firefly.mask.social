import { find } from 'lodash-es';

import { Language } from '@/services/translate.js';

export const getLangNameFromLocal = (locale: string) => {
    const matchedLang = find(Object.entries(Language), ([_, value]) => {
        return `${value}`.startsWith(locale);
    });
    return matchedLang?.[0];
};
