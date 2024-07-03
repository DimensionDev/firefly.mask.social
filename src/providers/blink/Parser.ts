import { compact } from 'lodash-es';

import { URI_COMPONENT_REGEXP, URL_REGEX } from '@/constants/regexp.js';
import { parseURL } from '@/helpers/parseURL.js';
import { type ActionScheme, SchemeType } from '@/types/blink.js';

class Parser {
    // Regular expressions to match the different blink formats
    private static BLINK_REGEXP = new RegExp(
        `(solana://${URL_REGEX.source})|(solana://${URI_COMPONENT_REGEXP.source})|(${URL_REGEX.source})`,
        'gi',
    );

    /**
     * Extracts all blinks from a given text.
     * @param text The text to parse.
     * @returns An array of found blink URLs.
     */
    public extractSchemes(text: string): ActionScheme[] {
        return compact(
            [...text.matchAll(Parser.BLINK_REGEXP)].map(([blink]) => {
                // scheme a: an explicit Action URL prefixed with 'solana://'
                if (blink.startsWith('solana://')) {
                    const actionUrl = decodeURIComponent(blink.replace('solana://', ''));
                    if (actionUrl.match(URL_REGEX) && actionUrl.startsWith('https://'))
                        return {
                            type: SchemeType.ActionUrl,
                            url: actionUrl,
                            blink,
                        };
                    return null;
                }

                // scheme c: embedding an action url in an “interstitial” site or mobile app deep link url
                const u = parseURL(blink);
                const action = u?.searchParams.get('action');
                const actionUrl = action?.startsWith('solana-action:')
                    ? decodeURIComponent(action.replace('solana-action:', ''))
                    : null;
                if (actionUrl?.match(URL_REGEX) && actionUrl.startsWith('https://'))
                    return {
                        type: SchemeType.Interstitial,
                        url: actionUrl,
                        blink,
                    };

                // scheme b: linked to an actions API via an actions.json file
                if (u && blink.startsWith('https://'))
                    return {
                        type: SchemeType.ActionsJson,
                        url: blink,
                        blink,
                    };

                // unknown scheme
                return null;
            }),
        );
    }
}

export const BlinkParser = new Parser();
