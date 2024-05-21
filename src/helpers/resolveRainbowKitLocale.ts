import { createLookupTableResolver } from '@masknet/shared-base';
import type { Locale as RainbowKitLocale } from '@rainbow-me/rainbowkit';

import { Locale } from '@/types/index.js';

// Learn more: https://www.rainbowkit.com/docs/localization#supported-languages
export const resolveRainbowKitLocale = createLookupTableResolver<Locale, RainbowKitLocale>(
    {
        [Locale.en]: 'en',
        [Locale.zhHans]: 'zh-CN',
        [Locale.zhHant]: 'zh-CN',
    },
    'en',
);
