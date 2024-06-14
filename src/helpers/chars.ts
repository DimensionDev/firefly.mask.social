import { safeUnreachable } from '@masknet/kit';
import { first } from 'lodash-es';
import { v4 as uuid } from 'uuid';

import { type SocialSource, Source } from '@/constants/enum.js';
import type { RP_HASH_TAG } from '@/constants/index.js';
import { getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import type { Profile } from '@/providers/types/Firefly.js';
import type { CompositePoll } from '@/providers/types/Poll.js';
import { resolveLengthCalculator } from '@/services/resolveLengthCalculator.js';

export enum CHAR_TAG {
    FIREFLY_RP = 'ff_rp',
    MENTION = 'mention_tag',
}

/**
 * chars with metadata
 */
interface ComplexChars {
    // tag is used to identify the type of content
    tag: CHAR_TAG;
    // if visible is false, content will not be displayed
    // but the length of content will be counted
    visible: boolean;
    // content is the actual content
    content: string;
}

interface RP_Chars extends ComplexChars {
    tag: CHAR_TAG.FIREFLY_RP;
    visible: boolean;
    content: typeof RP_HASH_TAG;
}

interface Mention_Chars {
    tag: CHAR_TAG.MENTION;
    visible: boolean;
    content: string;
    profiles: Profile[];
}

export type Chars = string | Array<string | RP_Chars | Mention_Chars>;

/**
 * Stringify chars into plain text
 * @param chars
 * @param visibleOnly
 * @returns
 */
export function readChars(chars: Chars, visibleOnly = false, source?: SocialSource) {
    return (Array.isArray(chars) ? chars : [chars])
        .map((x) => {
            if (typeof x === 'string') return x;
            if (!x.visible && visibleOnly) return '';
            switch (x.tag) {
                case CHAR_TAG.FIREFLY_RP:
                    return `${x.content}\n`;
                case CHAR_TAG.MENTION:
                    if (source) {
                        const target = x.profiles.find((profile) => source === resolveSource(profile.platform));
                        return target ? `${source === Source.Lens ? '@lens/' : '@'}${target.handle}` : x.content;
                    }
                    return x.content;
                default:
                    safeUnreachable(x);
                    return '';
            }
        })
        .join('');
}

export function writeChars(chars: Chars, newChars: Chars) {
    const charsWrapped = Array.isArray(chars) ? chars : [chars];
    const newCharsWrapped = Array.isArray(newChars) ? newChars : [newChars];

    return [
        // discard visible chars, only keep invisible ones
        ...charsWrapped.filter((x) => (typeof x === 'string' ? false : !x.visible)),
        ...newCharsWrapped,
    ];
}

function calculateLength(chars: Chars, availableSources: SocialSource[], visibleOnly?: boolean): number {
    return Math.max(...availableSources.map((x) => resolveLengthCalculator(x)(readChars(chars, visibleOnly, x))));
}

export function measureChars(chars: Chars, availableSources: SocialSource[], poll: CompositePoll | null) {
    const length = calculateLength(chars, availableSources);
    const visibleLength = calculateLength(chars, availableSources, true);
    const pollFrameUrlLength =
        availableSources.length === 1 && first(availableSources) === Source.Lens && poll
            ? getPollFrameUrl(poll?.id ?? `poll-${uuid()}`).length
            : 0;

    return {
        length,
        visibleLength,
        invisibleLength: length - visibleLength + pollFrameUrlLength,
    };
}
