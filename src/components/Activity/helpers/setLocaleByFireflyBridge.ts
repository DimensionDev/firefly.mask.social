import { Locale } from '@/constants/enum.js';
import { setLocale } from '@/i18n/index.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';

export async function setLocaleByFireflyBridge() {
    if (!fireflyBridgeProvider.supported) return;
    const language = await fireflyBridgeProvider.request(SupportedMethod.GET_LANGUAGE, {});
    const locale = {
        en: Locale.en,
        zh: Locale.zhHans,
    }[language];
    if (!locale) return;
    const data = new FormData();
    data.append('locale', language);
    setLocale(locale);
}
