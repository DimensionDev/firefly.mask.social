import { addSharedI18N } from '@masknet/shared';
import { createI18NBundle, i18NextInstance } from '@masknet/shared-base';
import { addShareBaseI18N } from '@masknet/shared-base-ui';
import { initReactI18next } from 'react-i18next';

import en_US from '@/mask/setup/locales/en-US.json';
import ja_JP from '@/mask/setup/locales/ja-JP.json';
import ko_KR from '@/mask/setup/locales/ko-KR.json';
import zh_CN from '@/mask/setup/locales/zh-CN.json';
import zh_TW from '@/mask/setup/locales/zh-TW.json';

export const languages = {
    en: en_US,
    ja: ja_JP,
    ko: ko_KR,
    'zh-CN': zh_CN,
    zh: zh_TW,
};

const addMaskI18N = createI18NBundle('mask', languages);

addMaskI18N(i18NextInstance);
initReactI18next.init(i18NextInstance);
addSharedI18N(i18NextInstance);
addShareBaseI18N(i18NextInstance);
