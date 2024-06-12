/* cspell:disable */

import urlcat from 'urlcat';

import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Language } from '@/services/translate.js';
import { settings } from '@/settings/index.js';

interface DetectionResponse {
    data: { language: Language };
}

/**
 * Detect content language.
 *
 * @param {string} text - The text to be detected.
 * @returns - Content language or N/A when detect failed.
 *
 */
export async function getContentLanguage(text: string): Promise<Language> {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/ai/detect-language');
    const { data } = await fireflySessionHolder.fetch<DetectionResponse>(url, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });

    return data?.language;
}
