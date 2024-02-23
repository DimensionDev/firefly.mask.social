import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin.js';

import { EMAIL_REGEX, MENTION_REGEX, URL_REGEX } from '@/constants/regex.js';

const MATCHERS = [
    (text: string) => {
        const match = URL_REGEX.exec(text);
        if (match === null) {
            return null;
        }
        const fullMatch = match[0];
        return {
            index: match.index,
            length: fullMatch.length,
            text: fullMatch,
            url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
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

function LexicalAutoLinkPlugin() {
    return <AutoLinkPlugin matchers={MATCHERS} />;
}

export default LexicalAutoLinkPlugin;
