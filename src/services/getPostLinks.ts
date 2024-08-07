import urlcat from 'urlcat';

import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { attemptUntil } from '@/helpers/attemptUntil.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isValidDomain } from '@/helpers/isValidDomain.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { BlinkLoader } from '@/providers/blink/Loader.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { Action } from '@/types/blink.js';
import type { Frame, LinkDigestedResponse } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';
import type { LinkDigested } from '@/types/og.js';

export async function getPostFrame(url: string): Promise<Frame | null> {
    if (env.external.NEXT_PUBLIC_FRAME !== STATUS.Enabled) return null;
    if (!url || isValidDomain(url)) return null;
    const response = await fetchJSON<ResponseJSON<LinkDigestedResponse>>(
        urlcat('/api/frame', {
            link: (await resolveTCOLink(url)) ?? url,
        }),
    );
    return response.success ? response.data.frame : null;
}

export async function getPostBlinkAction(url: string): Promise<Action | null> {
    if (env.external.NEXT_PUBLIC_BLINK !== STATUS.Enabled) return null;
    if (!url || isValidDomain(url)) return null;
    return BlinkLoader.fetchAction((await resolveTCOLink(url)) ?? url);
}

export async function getPostOembed(url: string, post?: Pick<Post, 'quoteOn'>): Promise<LinkDigested | null> {
    if (env.external.NEXT_PUBLIC_OPENGRAPH !== STATUS.Enabled) return null;
    if (!url || isValidDomain(url) || post?.quoteOn) return null;
    const linkDigested = await fetchJSON<ResponseJSON<LinkDigested>>(
        urlcat('/api/oembed', {
            link: (await resolveTCOLink(url)) ?? url,
        }),
    );
    return linkDigested.success ? linkDigested.data : null;
}

export async function getPostLinks(url: string, post?: Pick<Post, 'quoteOn'>) {
    return attemptUntil<{
        oembed?: LinkDigested;
        frame?: Frame;
        action?: Action;
    } | null>(
        [
            async () => {
                const frame = await getPostFrame(url);
                return frame ? { frame } : null;
            },
            async () => {
                const action = await getPostBlinkAction(url);
                return action ? { action } : null;
            },
            async () => {
                const oembed = await getPostOembed(url, post);
                return oembed ? { oembed } : null;
            },
        ],
        null,
        (x) => !x,
    );
}
