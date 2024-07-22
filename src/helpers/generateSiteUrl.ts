import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { isSameOriginUrl } from '@/helpers/isSameOriginUrl.js';
import { parseURL } from '@/helpers/parseURL.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import type { Profile } from '@/providers/types/Firefly.js';
import type { Post } from '@/providers/types/SocialMedia.js';

enum SiteType {
    Hey = 'hey',
}

export interface Context {
    post?: Post;
    profile?: Profile;
}

function parseSiteType(u: URL) {
    if (isSameOriginUrl(u, 'hey.xyz')) {
        return SiteType.Hey;
    }
    return;
}

function parsePostUrl(u: URL, context?: Context) {
    const siteType = parseSiteType(u);

    switch (siteType) {
        case SiteType.Hey:
            if (u.pathname.startsWith('/posts')) {
                const fragments = u.pathname.split('/');
                const postId = fragments[2];

                if (/0x[a-z\d-]+/.test(postId)) {
                    return {
                        source: Source.Lens,
                        postId,
                    };
                }
            }
            return;
        default:
            return;
    }
}

function parseProfileUrl(u: URL, context?: Context) {
    const siteType = parseSiteType(u);

    switch (siteType) {
        case SiteType.Hey:
            if (u.pathname.startsWith('/u')) {
                const fragments = u.pathname.split('/');
                const profileId = fragments[2];

                if (/\w+/.test(profileId)) {
                    return {
                        source: Source.Lens,
                        profileId,
                    };
                }
            }
            return;
        default:
            return;
    }
}

export function generateSiteUrl(url: string | URL, context?: Context) {
    const u = typeof url === 'string' ? parseURL(url) : url;
    if (!u) throw new Error(`Failed to parse URL = ${url}.`);

    const postUrl = parsePostUrl(u);
    if (postUrl) {
        return urlcat(SITE_URL, `/post/${postUrl.postId}`, {
            source: resolveSourceInURL(postUrl.source),
        });
    }

    const profileUrl = parseProfileUrl(u);
    if (profileUrl) {
        return urlcat(SITE_URL, `/profile/${profileUrl.profileId}`, {
            source: resolveSourceInURL(profileUrl.source),
        });
    }

    return url;
}
