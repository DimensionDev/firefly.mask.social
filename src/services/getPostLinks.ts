import { Action, setProxyUrl } from '@dialectlabs/blinks';
import urlcat from 'urlcat';

import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { attemptUntil } from '@/helpers/attemptUntil.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isValidDomain } from '@/helpers/isValidDomain.js';
import { parseURL } from '@/helpers/parseURL.js';
import { isValidPollFrameUrl } from '@/helpers/resolveEmbedMediaType.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { getPostIFrame } from '@/providers/og/readers/iframe.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { Frame, LinkDigestedResponse } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';
import type { LinkDigested } from '@/types/og.js';

function isValidPostLink(url: string) {
    const parsed = parseURL(url);
    if (!parsed) return false;

    // such as ens domains
    if (isValidDomain(url)) return false;

    // file extension
    if (/\.\w{1,6}$/i.test(parsed.pathname)) return false;

    return true;
}

export async function getPostFrame(url: string): Promise<Frame | null> {
    if (env.external.NEXT_PUBLIC_FRAME !== STATUS.Enabled) return null;
    if (!url || !isValidPostLink(url)) return null;
    const response = await fetchJSON<ResponseJSON<LinkDigestedResponse>>(
        urlcat('/api/frame', {
            link: (await resolveTCOLink(url)) ?? url,
        }),
    );
    return response.success ? response.data.frame : null;
}

export async function getPostBlinkAction(url: string): Promise<Action | null> {
    if (env.external.NEXT_PUBLIC_BLINK !== STATUS.Enabled) return null;
    if (!url || !isValidPostLink(url)) return null;
    const actionUrl = (await resolveTCOLink(url)) ?? url;
    setProxyUrl(urlcat(location.origin, '/api/blink/proxy'));
    return new Proxy(await Action.fetch(actionUrl), {
        get(target, prop, receiver) {
            // @ts-ignore _data is private, action using a proxy image, it is necessary to remove the proxy here https://github.com/dialectlabs/blinks/blob/f470e5815732f7efb6359c871598cc3ad059b26c/src/api/Action/Action.ts#L118
            if (prop === 'icon') return target._data.icon;
            // @ts-ignore _data is private, fix the URL after proxy
            if (prop === 'url' && target._data.url) return target._data.url;
            return Reflect.get(target, prop, receiver);
        },
    });
}

export async function getPostOembed(url: string, post?: Pick<Post, 'quoteOn'>): Promise<LinkDigested | null> {
    if (env.external.NEXT_PUBLIC_OPENGRAPH !== STATUS.Enabled) return null;
    if (!url || !isValidPostLink(url)) return null;
    if (post?.quoteOn) return null;
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
        html?: string;
    } | null>(
        [
            async () => {
                // try iframe first. As we don't have to call other services if matched
                const html = getPostIFrame(null, url);
                return html ? { html } : null;
            },
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

export function getPollIdFromLink(url: string) {
    if (!isValidPollFrameUrl(url)) return;

    const parsed = parseURL(url);

    return parsed?.pathname.split('/')[2];
}
