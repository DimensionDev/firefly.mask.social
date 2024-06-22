import { safeUnreachable } from '@masknet/kit';
import { v4 as uuid } from 'uuid';

import { type SocialSource, Source } from '@/constants/enum.js';
import { MAX_CHAR_SIZE_PER_POST, type RP_HASH_TAG } from '@/constants/index.js';
import { getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import type { Profile } from '@/providers/types/Firefly.js';
import { resolveLengthCalculator } from '@/services/resolveLengthCalculator.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export enum CHAR_TAG {
    FIREFLY_RP = 'ff_rp',
    MENTION = 'mention_tag',
    FRAME = 'frame_tag',
}

interface Segment {
    // tag is used to identify the type of content
    tag: CHAR_TAG;
    // if visible is false, content will not be displayed
    // but the length of content will be counted
    visible: boolean;
    // content is the actual content
    content: string;
}

interface RP_Chars extends Segment {
    tag: CHAR_TAG.FIREFLY_RP;
    visible: boolean;
    content: typeof RP_HASH_TAG;
}

interface MentionChars extends Segment {
    tag: CHAR_TAG.MENTION;
    visible: boolean;
    content: string;
    profiles: Profile[];
}

interface FrameChars extends Segment {
    id: string;
    tag: CHAR_TAG.FRAME;
    visible: boolean;
    // content is not used
    content: never;
}

export type ComplexChars = RP_Chars | MentionChars | FrameChars;
export type Chars = string | Array<string | ComplexChars>;

/**
 * Stringify chars into plain text
 * @param chars
 * @param visibleOnly
 * @returns
 */
export function readChars(chars: Chars, strategy: 'both' | 'visible' | 'invisible' = 'both', source?: SocialSource) {
    return (Array.isArray(chars) ? chars : [chars])
        .map((x) => {
            if (typeof x === 'string') {
                return strategy === 'invisible' ? '' : x;
            }
            if (x.visible && strategy === 'invisible') return '';
            if (!x.visible && strategy === 'visible') return '';
            switch (x.tag) {
                case CHAR_TAG.FIREFLY_RP:
                    return `${x.content}\n`;
                case CHAR_TAG.MENTION:
                    if (source) {
                        const target = x.profiles.find((profile) => source === resolveSource(profile.platform));
                        return target ? `${source === Source.Lens ? '@lens/' : '@'}${target.handle}` : x.content;
                    }
                    return x.content;
                case CHAR_TAG.FRAME:
                    if (source === Source.Lens) return `${getPollFrameUrl(x.id || `poll-${uuid()}`, source)}\n`;
                    return '';
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

export function measureChars(post: CompositePost) {
    const { chars, availableSources } = post;

    return {
        // max(visible x1, visible x2, visible x3)
        usedLength: Math.max(
            ...availableSources.map((x) => resolveLengthCalculator(x)(readChars(chars, 'visible', x))),
        ),
        // min(limit_y1 - invisible, limit_y2 - invisible, limit_y3 - invisible)
        availableLength: Math.min(
            ...availableSources.map(
                (x) => MAX_CHAR_SIZE_PER_POST[x] - resolveLengthCalculator(x)(readChars(chars, 'invisible', x)),
            ),
        ),
    };
}
