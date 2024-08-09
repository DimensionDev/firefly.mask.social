import { last } from 'lodash-es';
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
import { parseURL } from '@/helpers/parseURL.js';

function isValidPostLink(url: string) {
    const parsed = parseURL(url);
    if (!parsed) return false;

    // such as ens domains
    if (isValidDomain(url)) return false;

    // file extension
    if (/\.\w{1,6}$/i.test(parsed.pathname)) return false;

    return true;
}

export async function getPostFrame(urls: string[]): Promise<Frame | null> {
    if (env.external.NEXT_PUBLIC_FRAME !== STATUS.Enabled) return null;
    if (!urls?.length) return null;

    return attemptUntil(
        urls.filter(isValidPostLink).map((y) => async () => {
            const response = await fetchJSON<ResponseJSON<LinkDigestedResponse>>(
                urlcat('/api/frame', {
                    link: (await resolveTCOLink(y)) ?? y,
                }),
            );
            return response.success ? response.data.frame : null;
        }),
        null,
        (x) => !x,
    );
}

export async function getPostBlinkAction(urls: string[]): Promise<Action | null> {
    if (env.external.NEXT_PUBLIC_BLINK !== STATUS.Enabled) return null;
    if (!urls?.length) return null;

    return attemptUntil(
        urls.filter(isValidPostLink).map((url) => async () => {
            return BlinkLoader.fetchAction((await resolveTCOLink(url)) ?? url);
        }),
        null,
        (x) => !x,
    );
}

export async function getPostOembed(urls: string[], post?: Pick<Post, 'quoteOn'>): Promise<LinkDigested | null> {
    if (env.external.NEXT_PUBLIC_OPENGRAPH !== STATUS.Enabled) return null;

    const url = last(urls);
    if (!url || !isValidPostLink(url)) return null;
    if (post?.quoteOn) return null;

    const linkDigested = await fetchJSON<ResponseJSON<LinkDigested>>(
        urlcat('/api/oembed', {
            link: (await resolveTCOLink(url)) ?? url,
        }),
    );
    return linkDigested.success ? linkDigested.data : null;
}

export async function getPostLinks(oembedUrls: string[], post?: Pick<Post, 'quoteOn'>) {
    return attemptUntil<{
        oembed?: LinkDigested;
        frame?: Frame;
        action?: Action;
    } | null>(
        [
            async () => {
                const frame = await getPostFrame(oembedUrls);
                return frame ? { frame } : null;
            },
            async () => {
                const action = await getPostBlinkAction(oembedUrls);
                return action ? { action } : null;
            },
            async () => {
                const oembed = await getPostOembed(oembedUrls, post);
                return oembed ? { oembed } : null;
            },
        ],
        null,
        (x) => !x,
    );
}
