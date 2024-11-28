import dayjs from 'dayjs';
import urlcat from 'urlcat';
import { v4 as uuid } from 'uuid';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { ReportCrossPostResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';
import type { CompositePost } from '@/store/useComposeStore.js';

interface Report {
    // client uuid for distinguishing logs
    relation_id: string;
    // in seconds
    post_time: number;
    post_id: string;
    // profile id in such platforms as Lens, Farcaster, etc.
    platform_id: string;
    ua_type: 'web' | 'ios' | 'android' | 'schedule:web' | 'schedule:ios' | 'schedule:android';
    // platform name
    platform: string;
}

const resolvePlatform = createLookupTableResolver<SocialSource, string>(
    {
        [Source.Farcaster]: 'farcaster',
        [Source.Lens]: 'lens',
        [Source.Twitter]: 'twitter',
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

async function report(post: CompositePost) {
    // a post shared across multiple platforms will have the same relation ID
    const relationId = uuid();
    const currentProfileAll = getCurrentProfileAll();

    const reports = SORTED_SOCIAL_SOURCES.map<Report | null>((x) => {
        const postId = post.postId[x];
        if (!postId) return null;

        const profileId = currentProfileAll[x]?.profileId;
        if (!profileId) return null;

        return {
            ua_type: 'web',
            relation_id: relationId,
            // TODO: post time of the original post
            post_time: dayjs(Date.now()).unix(),
            post_id: postId,
            // TODO: profile id of the author
            platform_id: profileId,
            platform: resolvePlatform(x),
        };
    });

    const allSettled = await Promise.allSettled(
        reports.map(async (x) => {
            if (!x) return null;
            return fireflySessionHolder.fetch<ReportCrossPostResponse>(
                // cspell: disable-next-line
                urlcat(settings.FIREFLY_ROOT_URL, '/api/logpush'),
                {
                    method: 'POST',
                    body: JSON.stringify(x),
                },
                {
                    withSession: true,
                },
            );
        }),
    );

    allSettled.forEach((x, i) => {
        const source = SORTED_SOCIAL_SOURCES[i];

        // ignore null report
        if (x.status === 'fulfilled' && x.value === null) return;

        if (x.status === 'rejected') {
            console.error(`[report]: occurs error when report ${source} post: ${post.postId[source]}`, x.reason);
        } else if (x.value?.code !== 0) {
            console.error(`[report]: occurs error when report ${source} post: ${post.postId[source]}`, x.value?.error);
        } else {
            console.info(`[report]: report ${source} post: ${post.postId[source]} successfully.`);
        }
    });
}

export async function reportCrossedPost(post: CompositePost) {
    requestIdleCallback(() => report(post));
}
