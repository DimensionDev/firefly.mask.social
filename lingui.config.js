import { formatter } from '@lingui/format-po';

const locales = ['en', 'pseudo'];

/** @type {import('@lingui/conf').LinguiConfig} */
export default {
    locales,
    sourceLocale: 'en',
    pseudoLocale: 'pseudo',
    compileNamespace: 'es',
    catalogs: [
        {
            path: 'src/locales/{locale}/messages',
            include: [
                'src/app/**',
                'src/configs/**',
                'src/components/**',
                'src/constants/**',
                'src/helpers/**',
                'src/hooks/**',
                'src/providers/**',
                'src/modals/**',
                'src/store/**',
            ],
            exclude: ['src/maskbook/**'],
        },
    ],
    fallbackLocales: {
        pseudo: 'en',
    },
    format: 'po',
    formatOptions: {
        origins: true,
        lineNumbers: false,
    },
    orderBy: 'messageId',
    format: formatter({ origins: false }),
};
