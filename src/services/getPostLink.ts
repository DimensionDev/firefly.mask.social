import { last } from 'lodash-es';
import urlcat from 'urlcat';

import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { attemptUntil } from '@/helpers/attemptUntil.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isValidDomain } from '@/helpers/isValidDomain.js';
import { resolveBlinkTCO } from '@/helpers/resolveBlinkTCO.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { BlinkLoader } from '@/providers/blink/Loader.js';
import { BlinkParser } from '@/providers/blink/Parser.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { Action } from '@/types/blink.js';
import type { Frame, LinkDigestedResponse } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';
import type { LinkDigested } from '@/types/og.js';

export async function getPostFrame(post: Post): Promise<Frame | null> {
    const urls = post.metadata.content?.oembedUrls ?? [];

    if (env.external.NEXT_PUBLIC_FRAME === STATUS.Enabled && urls.length > 0) {
        const frame = await attemptUntil(
            urls.map((x) => async () => {
                if (isValidDomain(x)) return null;
                const response = await fetchJSON<ResponseJSON<LinkDigestedResponse>>(
                    urlcat('/api/frame', {
                        link: (await resolveTCOLink(x)) ?? x,
                    }),
                );
                return response.success ? response.data.frame : null;
            }),
            null,
            (x) => !!x,
        );

        return frame;
    }
    return null;
}

export async function getPostBlinkAction(post: Post): Promise<Action | null> {
    const content = post.metadata.content?.content;

    if (env.external.NEXT_PUBLIC_BLINK === STATUS.Enabled) {
        // a blink could be a normal url, so the result is also available for the oembed and frame components
        const schemes =
            env.external.NEXT_PUBLIC_BLINK === STATUS.Enabled && content ? BlinkParser.extractSchemes(content) : [];
        const scheme = last(schemes);

        if (scheme) {
            const blink = await BlinkLoader.fetchAction(await resolveBlinkTCO(scheme));
            if (blink) return blink;
        }
    }

    return null;
}

export async function getPostOembed(post: Post): Promise<LinkDigested | null> {
    const url = post.metadata.content?.oembedUrl;

    if (env.external.NEXT_PUBLIC_OPENGRAPH === STATUS.Enabled) {
        if (!url || isValidDomain(url) || post.quoteOn) return null;

        const linkDigested = await fetchJSON<ResponseJSON<LinkDigested>>(
            urlcat('/api/oembed', {
                link: (await resolveTCOLink(url)) ?? url,
            }),
        );
        if (linkDigested.success) return linkDigested.data;
    }

    return null;
}

export async function getPostLinks(post: Post): Promise<{
    oembed?: LinkDigested;
    frame?: Frame;
    action?: Action;
} | null> {
    const frame = await getPostFrame(post);
    if (frame) return { frame };

    const action = await getPostBlinkAction(post);
    if (action) return { action };

    const oembed = await getPostOembed(post);
    if (oembed) return { oembed };

    return null;
}
