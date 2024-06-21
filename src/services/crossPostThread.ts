import { plural, t } from '@lingui/macro';
import { delay, safeUnreachable } from '@masknet/kit';
import { compact } from 'lodash-es';

import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { enqueueErrorsMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { failedAt } from '@/helpers/isPublishedThread.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { crossPost } from '@/services/crossPost.js';
import { reportCrossedPost } from '@/services/reportCrossedPost.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';

function shouldCrossPost(index: number, post: CompositePost) {
    return SORTED_SOCIAL_SOURCES.some(
        (x) => post.availableSources.includes(x) && !post.postId[x] && !post.parentPost[x],
    );
}

async function getParentPostById(source: SocialSource, postId: string) {
    if (!postId) throw new Error(`Failed to get parent post by id: ${postId}.`);
    switch (source) {
        case Source.Farcaster: {
            // in a thread, posts will sometimes be lost if we post too quickly
            await delay(3000);

            // the hub might be delay in updating the post
            const mock = { postId, author: {} } as unknown as Post;

            const profileId = useFarcasterStateStore.getState().currentProfile?.profileId;
            if (!profileId) throw new Error('Farcaster profileId is missing.');

            // fc should have profileId for replying
            mock.author.profileId = profileId;

            return mock;
        }
        case Source.Twitter:
            return { postId } as unknown as Post;
        case Source.Lens:
            await delay(1000);
            return { postId } as unknown as Post;
        default:
            safeUnreachable(source);
            return null;
    }
}

async function recompositePost(index: number, post: CompositePost, posts: CompositePost[]) {
    if (index === 0) return post;

    // reply to the previous published post in thread
    const previousPost = posts[index - 1];

    const all: Array<Promise<Post | null>> = [];

    SORTED_SOCIAL_SOURCES.forEach((x) => {
        const parentPostId = previousPost.postId[x];

        if (post.availableSources.includes(x) && parentPostId && !post.parentPost[x]) {
            all.push(getParentPostById(x, parentPostId));
        } else {
            all.push(Promise.resolve(null));
        }
    });

    const allSettled = await Promise.allSettled(all);

    return {
        ...post,
        parentPost: Object.fromEntries(
            SORTED_SOCIAL_SOURCES.map((x, i) => {
                const settled = allSettled[i];
                const fetchedPost = settled.status === 'fulfilled' ? settled.value : null;
                return [x, post.parentPost[x] ?? fetchedPost];
            }),
        ) as Record<Source, Post | null>,
    } satisfies CompositePost;
}

export async function crossPostThread({
    isRetry = false,
    progressCallback,
}: {
    isRetry?: boolean;
    progressCallback?: (progress: number) => void;
}) {
    const { posts } = useComposeStateStore.getState();
    if (posts.length === 1) throw new Error(t`A thread must have at least two posts.`);

    progressCallback?.(0);

    for (const [index, _] of posts.entries()) {
        const { posts: allPosts } = useComposeStateStore.getState();

        // skip post when recover from error
        if (!shouldCrossPost(index, _)) continue;

        // reply to the previous published post in thread
        const post = await recompositePost(index, _, allPosts);
        await crossPost(index === 0 ? 'compose' : 'reply', post, {
            skipIfPublishedPost: true,
            skipIfNoParentPost: true,
            skipRefreshFeeds: index !== posts.length - 1,
            skipCheckPublished: true,
            skipReportCrossedPost: true,
        });
        progressCallback?.((index + 1) / posts.length);
    }

    const { posts: updatedPosts } = useComposeStateStore.getState();

    // check publish result
    const failedPlatforms = failedAt(updatedPosts);

    if (failedPlatforms.length) {
        // the first error on each platform
        const allErrors = SORTED_SOCIAL_SOURCES.map(
            (x) => updatedPosts.find((y) => y.postError[x])?.postError[x] ?? null,
        );

        // show success message if no error found on certain platform
        SORTED_SOCIAL_SOURCES.forEach((x, i) => {
            const error = allErrors[i];
            if (error) return;
            const rootPost = updatedPosts[0];
            if (!rootPost.availableSources.includes(x)) return;
            if (!isRetry) {
                enqueueSuccessMessage(t`Your posts have published successfully on ${resolveSourceName(x)}.`);
            }
        });

        const firstPlatform = failedPlatforms[0] ? resolveSourceName(failedPlatforms[0]) : '';
        const secondPlatform = failedPlatforms[1] ? resolveSourceName(failedPlatforms[1]) : '';

        const message = plural(failedPlatforms.length, {
            one: `Your posts failed to publish on ${firstPlatform} due to an error. Click 'Retry' to attempt posting again.`,
            two: `Your posts failed to publish on ${firstPlatform} and ${secondPlatform} due to an error. Click 'Retry' to attempt posting again.`,
            other: "Your posts failed to publish due to an error. Click 'Retry' to attempt posting again.",
        });

        enqueueErrorsMessage(message, {
            errors: compact(allErrors),
            persist: true,
        });
        throw new Error(`Failed to post on: ${failedPlatforms.map(resolveSourceName).join(' ')}.`);
    } else {
        enqueueSuccessMessage(t`Your posts have published successfully.`);
    }

    // report crossed posts thread
    updatedPosts.forEach(reportCrossedPost);
}
