import { plural, t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { failedAt } from '@/helpers/isPublishedThread.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { crossPost } from '@/services/crossPost.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';

function shouldCrossPost(index: number, post: CompositePost) {
    return SORTED_SOURCES.some((x) => post.availableSources.includes(x) && !post.postId[x] && !post.parentPost[x]);
}

async function getParentPostById(source: SocialPlatform, postId: string) {
    switch (source) {
        case SocialPlatform.Farcaster: {
            // the hub might be delay in updating the post
            const mock = { postId, author: {} } as unknown as Post;

            const profileId = useFarcasterStateStore.getState().currentProfile?.profileId;
            if (!profileId) throw new Error('Farcaster profileId is missing.');

            // fc should have profileId for replying
            mock.author.profileId = profileId;

            return mock;
        }
        case SocialPlatform.Twitter:
            return { postId } as unknown as Post;
        case SocialPlatform.Lens:
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

    SORTED_SOURCES.forEach((x) => {
        const parentPostId = previousPost.postId[x];
        const provider = resolveSocialMediaProvider(x);

        if (post.availableSources.includes(x) && parentPostId && !post.parentPost[x] && provider) {
            all.push(getParentPostById(x, parentPostId));
        } else {
            all.push(Promise.resolve(null));
        }
    });

    const allSettled = await Promise.allSettled(all);

    return {
        ...post,
        parentPost: Object.fromEntries(
            SORTED_SOURCES.map((x, i) => {
                const settled = allSettled[i];
                const fetchedPost = settled.status === 'fulfilled' ? settled.value : null;
                return [x, post.parentPost[x] ?? fetchedPost];
            }),
        ) as Record<SocialPlatform, Post | null>,
    } satisfies CompositePost;
}

export async function crossPostThread() {
    const { posts } = useComposeStateStore.getState();
    if (posts.length === 1) throw new Error(t`A thread must have at least two posts.`);

    for (const [index, _] of posts.entries()) {
        const { posts: allPosts } = useComposeStateStore.getState();

        // skip post when recover from error
        if (!shouldCrossPost(index, _)) continue;

        // reply to the previous published post in thread
        const post = await recompositePost(index, _, allPosts);
        await crossPost(index === 0 ? 'compose' : 'reply', post, {
            skipIfPublishedPost: true,
            skipIfNoParentPost: true,
            skipPublishedCheck: true,
            skipRefreshFeeds: index !== posts.length - 1,
            options: {
                noSuccessMessage: true,
                noErrorMessage: true,
            },
        });
    }

    const { posts: updatedPosts } = useComposeStateStore.getState();
    const failedPlatforms = failedAt(updatedPosts);

    if (failedPlatforms.length) {
        const firstPlatform = failedPlatforms[0] ? resolveSourceName(failedPlatforms[0]) : '';
        const secondPlatform = failedPlatforms[1] ? resolveSourceName(failedPlatforms[1]) : '';

        const message = plural(failedPlatforms.length, {
            one: `Your post failed to publish on ${firstPlatform} due to an error. Click 'Retry' to attempt posting again.`,
            two: `Your post failed to publish on ${firstPlatform} and ${secondPlatform} due to an error. Click 'Retry' to attempt posting again.`,
            other: "Your post failed to publish due to an error. Click 'Retry' to attempt posting again.",
        });

        // the first error on each platform
        const allErrors = SORTED_SOURCES.map((x) => updatedPosts.find((y) => y.postError[x])?.postError[x] ?? null);

        // show success message if no error found on certain platform
        SORTED_SOURCES.forEach((x, i) => {
            const error = allErrors[i];
            if (error) return;
            enqueueSuccessMessage(t`Your posts has published successfully on ${resolveSourceName(x)}.`);
        });

        // concat all error messages for reporting
        const detailedMessage = SORTED_SOURCES.flatMap((x, i) => {
            const error = allErrors[i];
            if (!error) return [];

            const lines = [`${resolveSourceName(x)}: ${error.message}`];
            if (error.stack) lines.push(error.stack);
            lines.push('');
            return lines.join('\n');
        }).join('\n');

        enqueueErrorMessage(message, {
            detail: detailedMessage,
            persist: true,
        });
        throw new Error(`Failed to post on: ${failedPlatforms.map(resolveSourceName).join(' ')}.`);
    } else {
        enqueueSuccessMessage(t`Your posts have published successfully.`);
    }
}
