import { Action, type ActionGetResponse, setProxyUrl } from '@dialectlabs/blinks';
import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { FrameProtocol, Source, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { TWEET_SPACE_REGEX } from '@/constants/regexp.js';
import { attemptUntil } from '@/helpers/attemptUntil.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isValidDomain } from '@/helpers/isValidDomain.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { isValidPollFrameUrl } from '@/helpers/resolveEmbedMediaType.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { getPostIFrame } from '@/providers/og/readers/iframe.js';
import { Snapshot } from '@/providers/snapshot/index.js';
import type { SnapshotProposal } from '@/providers/snapshot/type.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getArticleIdFromUrl } from '@/services/getArticleIdFromUrl.js';
import { settings } from '@/settings/index.js';
import type { FireflyBlinkParserBlinkResponse } from '@/types/blink.js';
import type { Frame, LinkDigestedResponse } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';
import type { LinkDigested } from '@/types/og.js';

function isValidPostLink(url: string) {
    const parsed = parseUrl(url);
    if (!parsed) return false;

    // such as ens domains
    if (isValidDomain(url)) return false;

    // file extension
    // The ipfs link can sometimes be domain/pathname?fileName=xxx.jpg.
    if (/\.\w{1,6}$/i.test(url)) return false;

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
    const response = await fetchJSON<FireflyBlinkParserBlinkResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v1/solana/blinks/parse'),
        {
            method: 'POST',
            body: JSON.stringify({ url: actionUrl }),
        },
    );
    if (!response.data) return null;
    setProxyUrl(urlcat(location.origin, '/api/blink/proxy'));
    const action = await Action.fetch(response.data.actionApiUrl);
    // @ts-ignore _data is private, fix the URL after proxy
    const data = action._data as ActionGetResponse;
    return new Proxy(action, {
        get(target, prop, receiver) {
            if (prop === 'icon') return data.icon;
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

export async function getPostLinks(url: string, post: Post) {
    return attemptUntil<{
        oembed?: LinkDigested;
        frame?: Frame;
        action?: Action;
        html?: string;
        articleId?: string;
        spaceId?: string;
        snapshot?: SnapshotProposal;
    } | null>(
        [
            async () => {
                const spaceId = url.match(TWEET_SPACE_REGEX)?.[3];
                if (!spaceId) return null;
                return { spaceId };
            },
            async () => {
                const realUrl = (await resolveTCOLink(url)) ?? url;
                if (!realUrl) return null;
                const snapshot = await Snapshot.getSnapshotByLink(realUrl);
                if (!snapshot) return null;
                return { snapshot };
            },
            async () => {
                const realUrl = (await resolveTCOLink(url)) ?? url;
                if (!realUrl) return null;

                const articleId = await getArticleIdFromUrl(realUrl);
                if (!articleId) return null;

                return { articleId };
            },
            async () => {
                // try iframe first. As we don't have to call other services if matched
                const html = getPostIFrame(null, url);
                return html ? { html } : null;
            },
            async () => {
                const frame = await getPostFrame(url);
                if (!frame) return null;

                switch (post.source) {
                    case Source.Farcaster:
                        return { frame };
                    case Source.Lens:
                        return frame.protocol === FrameProtocol.OpenFrame ? { frame } : null;
                    case Source.Twitter:
                        return null;
                    default:
                        safeUnreachable(post.source);
                        return null;
                }
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

    const parsed = parseUrl(url);

    return parsed?.pathname.split('/')[2];
}
