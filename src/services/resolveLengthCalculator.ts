import twitter from 'twitter-text';

import { type SocialSource, Source } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

// calculate length for farcaster in bytes
// learn more: https://hackmd.io/@farcasterxyz/BJeFoxdy3
function calculateLengthForFarcaster(text: string) {
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(text);
    return encodedText.length;
}

// learn more: https://github.com/twitter/twitter-text/tree/master/js
function calculateLengthForTwitter(text: string) {
    const { weightedLength } = twitter.parseTweet(text);
    return weightedLength;
}

function calculateLengthForLens(text: string) {
    return Array.from(text).reduce((acc, char) => {
        if (char.charCodeAt(0) > 128) {
            return acc + 2;
        } else {
            return acc + 1;
        }
    }, 0);
}

export const resolveLengthCalculator = createLookupTableResolver<SocialSource, (text: string) => number>(
    {
        [Source.Lens]: calculateLengthForLens,
        [Source.Farcaster]: calculateLengthForFarcaster,
        [Source.Twitter]: calculateLengthForTwitter,
    },
    (source: SocialSource) => {
        throw new NotImplementedError(`Length calculator for ${source} is not implemented`);
    },
);
