import { find } from 'lodash-es';

import { Language } from '@/constants/enum.js';

export const getLangNameFromLocal = (locale: string) => {
    const matchedLang = find(Object.entries(Language), ([_, value]) => value === locale);
    return matchedLang?.[0];
};
