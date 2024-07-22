import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin.js';

import { EMAIL_REGEX, MENTION_REGEX, URL_REGEX } from '@/constants/regexp.js';
import { fixUrlProtocol } from '@/helpers/fixUrlProtocol.js';
import { isTopLevelDomain } from '@/helpers/isTopLevelDomain.js';

const MATCHERS = [
    (text: string) => {
        const match = URL_REGEX.exec(text);
        if (match === null) return null;

        const fullMatch = match[0];
        const url = fixUrlProtocol(fullMatch);
        if (!isTopLevelDomain(url)) return null;
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            url,
        };
    },
    (text: string) => {
        const match = EMAIL_REGEX.exec(text);
        return (
            match && {
                index: match.index,
                length: match[0].length,
                text: match[0],
                url: `mailto:${match[0]}`,
            }
        );
    },
    (text: string) => {
        const match = MENTION_REGEX.exec(text);
        if (match === null) return null;

        const fullMatch = match[0];
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            // TODO: profile link
            url: '',
        };
    },
];

export function LexicalAutoLinkPlugin() {
    return <AutoLinkPlugin matchers={MATCHERS} />;
}
