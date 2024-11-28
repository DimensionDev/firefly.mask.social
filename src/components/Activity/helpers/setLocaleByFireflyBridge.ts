import { Locale } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { setLocale } from '@/i18n/index.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';

const resolveLocale = createLookupTableResolver<'en' | 'zh', Locale>(
    {
        en: Locale.en,
        zh: Locale.zhHans,
    },
    (language) => {
        throw new UnreachableError('language', language);
    },
);

export async function setLocaleByFireflyBridge() {
    if (!fireflyBridgeProvider.supported) return;

    const language = await fireflyBridgeProvider.request(SupportedMethod.GET_LANGUAGE, {});

    const locale = resolveLocale(language as 'en' | 'zh');
    if (locale) setLocale(locale);
}
