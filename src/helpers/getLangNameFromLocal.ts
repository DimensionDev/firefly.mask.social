import { find } from 'lodash-es'

import { Language } from '@/constants/enum.js';

export const getLangNameFromLocal = (local: string, failedValue = local) => {
  const matchedLang = find(Object.entries(Language), ([_, value]) => value === local);
  return matchedLang?.[0] ?? failedValue;
}
