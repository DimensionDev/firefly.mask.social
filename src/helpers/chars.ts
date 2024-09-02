import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';
import { v4 as uuid } from 'uuid';

import { type SocialSource, Source } from '@/constants/enum.js';
import { MAX_CHAR_SIZE_PER_POST, MAX_CHAR_SIZE_VERIFY_PER_POST, type RP_HASH_TAG } from '@/constants/index.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import type { Profile } from '@/providers/types/Firefly.js';
import { resolveLengthCalculator } from '@/services/resolveLengthCalculator.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export enum CHAR_TAG {
    FIREFLY_RP = 'ff_rp',
    MENTION = 'mention_tag',
    FRAME = 'frame_tag',
    PROMOTE_LINK = 'promote_link',
}

interface Segment {
    // tag is used to identify the type of content
    tag: CHAR_TAG;
    // if visible is false, content will not be displayed
    // but the length of content will be counted
    visible: boolean;
    // content is the actual content
    content: string;
    // sortNo is used to sort the content
    sortNo?: number;
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

interface PromoteLinkChars extends Segment {
    tag: CHAR_TAG.PROMOTE_LINK;
}

export type ComplexChars = RP_Chars | MentionChars | FrameChars | PromoteLinkChars;
export type Chars = string | Array<string | ComplexChars>;

/**
 * Stringify chars into plain text
 * @param chars
 * @param visibleOnly
 * @returns
 */
export function readChars(chars: Chars, strategy: 'both' | 'visible' | 'invisible' = 'both', source?: SocialSource) {
    const list = (Array.isArray(chars) ? chars : [chars]).slice();

    const promoteLinkChars = list.find((x) => (typeof x === 'string' ? false : x.tag === CHAR_TAG.PROMOTE_LINK)) as
        | PromoteLinkChars
        | undefined;

    const promoteLink = promoteLinkChars?.content;
    const profile = source ? getCurrentProfile(source) : null;
    const specifiedUrl = profile ? urlcat(location.origin, getProfileUrl(profile)) : '';

    return list
        .sort((a, b) => {
            const aSortNo = typeof a === 'string' ? 0 : a.sortNo || 0;
            const bSortNo = typeof b === 'string' ? 0 : b.sortNo || 0;
            return aSortNo - bSortNo;
        })
        .map((x) => {
            if (typeof x === 'string') {
                if (strategy === 'invisible') return '';
                return promoteLink && specifiedUrl ? x.replace(promoteLink, specifiedUrl) : x;
            }
            if (x.visible && strategy === 'invisible') return '';
            if (!x.visible && strategy === 'visible') return '';
            switch (x.tag) {
                case CHAR_TAG.FIREFLY_RP:
                    return `${x.content}\n`;
                case CHAR_TAG.MENTION:
                    if (source) {
                        const target = x.profiles.find((profile) => source === resolveSource(profile.platform));
                        return target?.handle
                            ? `${source === Source.Lens ? '@lens/' : '@'}${target.handle}`
                            : x.content;
                    }
                    return x.content;
                case CHAR_TAG.FRAME:
                    if (source === Source.Lens) return ` ${getPollFrameUrl(x.id || `poll-${uuid()}`, source)}\n`;
                    return '';
                case CHAR_TAG.PROMOTE_LINK:
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

function resolvePeerPostMaxChars(source: SocialSource, post: CompositePost) {
    const profile = getCurrentProfile(source);
    const currentMax = profile?.verified ? MAX_CHAR_SIZE_VERIFY_PER_POST[source] : MAX_CHAR_SIZE_PER_POST[source];

    return post.poll
        ? Math.min(
              currentMax,
              source !== Source.Twitter ? 255 + readChars(post.chars, 'invisible', source).length : currentMax,
          )
        : currentMax;
}

export function measureChars(post: CompositePost) {
    const { chars, availableSources } = post;

    if (!availableSources.length) return { usedLength: 0, availableLength: 0 };

    return {
        // max(visible x1, visible x2, visible x3)
        usedLength: Math.max(
            ...availableSources.map((source) => resolveLengthCalculator(source)(readChars(chars, 'visible', source))),
        ),
        // min(limit_y1 - invisible, limit_y2 - invisible, limit_y3 - invisible)
        availableLength: Math.min(
            ...availableSources.map(
                (source) =>
                    resolvePeerPostMaxChars(source, post) -
                    resolveLengthCalculator(source)(readChars(chars, 'invisible', source)),
            ),
        ),
    };
}
