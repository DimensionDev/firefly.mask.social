import { createLookupTableResolver } from '@masknet/shared-base';
import type { Locale as RainbowKitLocale } from '@rainbow-me/rainbowkit';

import { Locale } from '@/types/index.js';

export const resolveRainbowKitLocale = createLookupTableResolver<Locale, RainbowKitLocale>(
    {
        [Locale.en]: 'en',
        [Locale.zhHans]: 'zh-CN',
    },
    'en',
);
