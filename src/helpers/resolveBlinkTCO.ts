import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { BlinkParser } from '@/providers/blink/Parser.js';
import type { ActionScheme } from '@/types/blink.js';

export async function resolveBlinkTCO(schema: ActionScheme) {
    const url = await resolveTCOLink(schema.url);
    if (!url) return schema;
    return BlinkParser.parseInterstitial(url) ?? { ...schema, url };
}
