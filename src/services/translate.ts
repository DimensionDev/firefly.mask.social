/* cspell:disable */

import urlcat from 'urlcat';

import type { Language } from '@/constants/enum.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

export interface Translation {
    text: string;
    to: Language;
}

interface TranslationResponse {
    data: Array<{
        detectedLanguage: {
            language: Language;
            score: number;
        };
        translations: Translation[];
    }>;
}

/**
 * Translates the provided text to the specified target language.
 *
 * @param {Language} to - The target language code to which the text should be translated.
 * @param {string} text - The text to be translated.
 * @returns - A promise that resolves to an object containing the detected language and translations.
 *
 */
export async function translate(
    to: Language,
    text: string,
): Promise<{
    detectedLanguage: Language;
    translations: Translation[];
}> {
    const url = urlcat(FIREFLY_ROOT_URL, '/v1/misc/translate')
    const { data } = await fetchJSON<TranslationResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
            toLanguage: to,
            text,
        }),
    });

    return {
        detectedLanguage: data[0]?.detectedLanguage.language,
        translations: data[0]?.translations,
    };
}
