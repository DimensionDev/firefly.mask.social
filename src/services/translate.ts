/* cspell:disable */

import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

// Learn more supported languages here:
// https://api.cognitive.microsofttranslator.com/languages?api-version=3.0
export enum Language {
    Afrikaans = 'af',
    Amharic = 'am',
    Arabic = 'ar',
    Assamese = 'as',
    Azerbaijani = 'az',
    Bashkir = 'ba',
    Bulgarian = 'bg',
    Bhojpuri = 'bho',
    Bangla = 'bn',
    Tibetan = 'bo',
    Bodo = 'brx',
    Bosnian = 'bs',
    Catalan = 'ca',
    Czech = 'cs',
    Welsh = 'cy',
    Danish = 'da',
    German = 'de',
    Dogri = 'doi',
    Lower_Sorbian = 'dsb',
    Divehi = 'dv',
    Greek = 'el',
    English = 'en',
    Spanish = 'es',
    Estonian = 'et',
    Basque = 'eu',
    Persian = 'fa',
    Finnish = 'fi',
    Filipino = 'fil',
    Fijian = 'fj',
    Faroese = 'fo',
    French = 'fr',
    French_Canada = 'fr-CA',
    Irish = 'ga',
    Galician = 'gl',
    Konkani = 'gom',
    Gujarati = 'gu',
    Hausa = 'ha',
    Hebrew = 'he',
    Hindi = 'hi',
    Croatian = 'hr',
    Upper_Sorbian = 'hsb',
    Haitian_Creole = 'ht',
    Hungarian = 'hu',
    Armenian = 'hy',
    Indonesian = 'id',
    Igbo = 'ig',
    Inuinnaqtun = 'ikt',
    Icelandic = 'is',
    Italian = 'it',
    Inuktitut = 'iu',
    Inuktitut_Latin = 'iu-Latn',
    Japanese = 'ja',
    Georgian = 'ka',
    Kazakh = 'kk',
    Khmer = 'km',
    Kurdish_Northern = 'kmr',
    Kannada = 'kn',
    Korean = 'ko',
    Kashmiri = 'ks',
    Kurdish_Central = 'ku',
    Kyrgyz = 'ky',
    Lingala = 'ln',
    Lao = 'lo',
    Lithuanian = 'lt',
    Ganda = 'lug',
    Latvian = 'lv',
    Chinese_Literary = 'lzh',
    Maithili = 'mai',
    Malagasy = 'mg',
    Māori = 'mi',
    Macedonian = 'mk',
    Malayalam = 'ml',
    Mongolian_Cyrillic = 'mn-Cyrl',
    Mongolian_Traditional = 'mn-Mong',
    Marathi = 'mr',
    Malay = 'ms',
    Maltese = 'mt',
    Hmong_Daw = 'mww',
    Myanmar_Burmese = 'my',
    Norwegian = 'nb',
    Nepali = 'ne',
    Dutch = 'nl',
    Sesotho_sa_Leboa = 'nso',
    Nyanja = 'nya',
    Odia = 'or',
    Querétaro_Otomi = 'otq',
    Punjabi = 'pa',
    Polish = 'pl',
    Dari = 'prs',
    Pashto = 'ps',
    Portuguese_Brazil = 'pt',
    Portuguese_Portugal = 'pt-PT',
    Romanian = 'ro',
    Russian = 'ru',
    Rundi = 'run',
    Kinyarwanda = 'rw',
    Sindhi = 'sd',
    Sinhala = 'si',
    Slovak = 'sk',
    Slovenian = 'sl',
    Samoan = 'sm',
    Shona = 'sn',
    Somali = 'so',
    Albanian = 'sq',
    Serbian_Cyrillic = 'sr-Cyrl',
    Serbian_Latin = 'sr-Latn',
    Sesotho = 'st',
    Swedish = 'sv',
    Swahili = 'sw',
    Tamil = 'ta',
    Telugu = 'te',
    Thai = 'th',
    Tigrinya = 'ti',
    Turkmen = 'tk',
    Klingon_Latin = 'tlh-Latn',
    Klingon_pIqaD = 'tlh-Piqd',
    Setswana = 'tn',
    Tongan = 'to',
    Turkish = 'tr',
    Tatar = 'tt',
    Tahitian = 'ty',
    Uyghur = 'ug',
    Ukrainian = 'uk',
    Urdu = 'ur',
    Uzbek_Latin = 'uz',
    Vietnamese = 'vi',
    Xhosa = 'xh',
    Yoruba = 'yo',
    Yucatec_Maya = 'yua',
    Cantonese_Traditional = 'yue',
    Chinese_Simplified = 'zh-Hans',
    Chinese_Traditional = 'zh-Hant',
    Zulu = 'zu',
}

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
    const url = urlcat(FIREFLY_ROOT_URL, '/v1/misc/translate');
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
