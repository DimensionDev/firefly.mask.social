// This file is auto generated. DO NOT EDIT
// Run `npx gulp sync-languages` to regenerate.
// Default fallback language in a family of languages are chosen by the alphabet order
// To overwrite this, please overwrite packages/scripts/src/locale-kit-next/index.ts
import en_US from '@/plugins/RedPacket/locales/en-US.json';
import ja_JP from '@/plugins/RedPacket/locales/ja-JP.json';
import ko_KR from '@/plugins/RedPacket/locales/ko-KR.json';
import qya_AA from '@/plugins/RedPacket/locales/qya-AA.json';
import zh_CN from '@/plugins/RedPacket/locales/zh-CN.json';
import zh_TW from '@/plugins/RedPacket/locales/zh-TW.json';

export const languages = {
    en: en_US,
    ja: ja_JP,
    ko: ko_KR,
    qy: qya_AA,
    'zh-CN': zh_CN,
    zh: zh_TW,
};
// @ts-ignore
if (import.meta.webpackHot) {
    // @ts-ignore
    import.meta.webpackHot.accept(
        ['./en-US.json', './ja-JP.json', './ko-KR.json', './qya-AA.json', './zh-CN.json', './zh-TW.json'],
        () =>
            globalThis.dispatchEvent?.(
                new CustomEvent('MASK_I18N_HMR', {
                    detail: [
                        'com.maskbook.red_packet',
                        { en: en_US, ja: ja_JP, ko: ko_KR, qy: qya_AA, 'zh-CN': zh_CN, zh: zh_TW },
                    ],
                }),
            ),
    );
}
