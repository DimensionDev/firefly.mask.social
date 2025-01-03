import { safeUnreachable } from '@masknet/kit';

import { ExternalSiteDomain, type SocialSource, Source } from '@/constants/enum.js';
import { TWEET_REGEX } from '@/constants/regexp.js';
import { getUrlSiteType } from '@/helpers/interceptExternalUrl.js';
import { resolvePostUrl } from '@/helpers/resolvePostUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { trimify } from '@/helpers/trimify.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';

async function captureProfileUrl(url: URL, regex: RegExp, source: SocialSource) {
    const { pathname } = url;

    const matched = regex.exec(pathname);
    const handle = trimify(matched?.[1] ?? '');
    if (handle) {
        const resolved =
            source === Source.Farcaster
                ? (await FarcasterSocialMediaProvider.getProfileByHandle(handle)).profileId
                : handle;
        return resolveProfileUrl(source, resolved);
    }

    return;
}

async function formatWarpcastUrl(url: URL) {
    return captureProfileUrl(url, /^\/([^/]+)$/u, Source.Farcaster);
}

function formatHeyUrl(url: URL) {
    return captureProfileUrl(url, /^\/u\/([^/]+)$/u, Source.Lens);
}

async function formatTwitterUrl(url: URL) {
    const profileUrl = await captureProfileUrl(url, /^\/([^/]+)$/u, Source.Twitter);
    if (profileUrl) return profileUrl;

    const matched = url.href.match(TWEET_REGEX);
    const tweetId = trimify(matched?.[3] ?? '');
    if (tweetId) {
        return resolvePostUrl(Source.Twitter, tweetId);
    }

    return;
}

export async function formatExternalLink(link: string) {
    const { siteType, parsedURL } = getUrlSiteType(link) ?? {};
    if (!siteType || !parsedURL) return;

    switch (siteType) {
        case ExternalSiteDomain.Warpcast:
            return formatWarpcastUrl(parsedURL);
        case ExternalSiteDomain.Hey:
            return formatHeyUrl(parsedURL);
        case ExternalSiteDomain.Twitter:
        case ExternalSiteDomain.X:
            return formatTwitterUrl(parsedURL);
        default:
            safeUnreachable(siteType);
            return;
    }
}
