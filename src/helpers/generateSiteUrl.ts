import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { parseURL } from '@/helpers/parseURL.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import type { Profile } from '@/providers/types/Firefly.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export interface Context {
    post?: Post;
    profile?: Profile;
}

function parsePostUrl(u: URL, context?: Context) {
    return {
        source: Source.Lens,
        postId: '',
    };
}

function parseProfileUrl(u: URL, context?: Context) {
    return {
        source: Source.Lens,
        profileId: '',
    };
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
            sourcE: resolveSourceInURL(profileUrl.source),
        });
    }

    return url;
}
