/* cspell:disable */

import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Language } from '@/services/translate.js';

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
    const url = urlcat(FIREFLY_ROOT_URL, '/ai/detect-language');
    const { data } = await fireflySessionHolder.fetch<DetectionResponse>(url, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });

    return data?.language;
}
