import { plural, t } from '@lingui/macro';
import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import { FireflyRedPacket } from '@masknet/web3-providers';
import { type FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { produce } from 'immer';
import { compact } from 'lodash-es';

import { queryClient } from '@/configs/queryClient.js';
import { NODE_ENV, type SocialSource } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { SORTED_SOCIAL_SOURCES, SUPPORTED_FRAME_SOURCES } from '@/constants/index.js';
import { CHAR_TAG, readChars } from '@/helpers/chars.js';
import { createDummyCommentPost } from '@/helpers/createDummyPost.js';
import { enqueueErrorsMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getCompositePost } from '@/helpers/getCompositePost.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import { failedAt } from '@/helpers/isPublishedPost.js';
import { resolvePostTo } from '@/helpers/resolvePostTo.js';
import { resolveRedPacketPlatformType } from '@/helpers/resolveRedPacketPlatformType.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { hasRpPayload } from '@/helpers/rpPayload.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { commitPoll } from '@/services/commitPoll.js';
import { reportCrossedPost } from '@/services/reportCrossedPost.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

async function refreshProfileFeed(source: SocialSource) {
    const currentProfileAll = getCurrentProfileAll();

    await queryClient.invalidateQueries({
        queryKey: ['posts', source, 'posts-of', currentProfileAll[source]?.profileId],
    });
    await queryClient.refetchQueries({
        queryKey: ['posts', source, 'posts-of', currentProfileAll[source]?.profileId],
        stale: true,
        type: 'active',
    });
}

async function updateRpClaimStrategy(compositePost: CompositePost) {
    const { postId, typedMessage, rpPayload } = compositePost;
    if (env.shared.NODE_ENV === NODE_ENV.Development) {
        if (rpPayload?.publicKey && !SORTED_SOCIAL_SOURCES.some((x) => postId[x])) {
            console.error("[cross post] No any post id for updating RedPacket's claim strategy.");
        }
    }

    if (hasRpPayload(typedMessage) && SORTED_SOCIAL_SOURCES.some((x) => postId[x]) && rpPayload?.publicKey) {
        const currentProfileAll = getCurrentProfileAll();
        const rpPayloadFromMeta = typedMessage?.meta?.get(RedPacketMetaKey) as RedPacketJSONPayload;

        const reactions = compact(
            SORTED_SOCIAL_SOURCES.map((x) => {
                const id = postId[x];
                return id
                    ? {
                          platform: resolveRedPacketPlatformType(x),
                          postId: id,
                      }
                    : null;
            }),
        );

        const claimPlatforms = compact(
            SORTED_SOCIAL_SOURCES.map((x) => {
                const currentProfile = currentProfileAll[x];
                return postId[x] && currentProfile
                    ? {
                          platformId: currentProfile.profileId,
                          platformName: resolveRedPacketPlatformType(x),
                      }
                    : null;
            }),
        );
        const postOn: FireflyRedPacketAPI.PostOn[] = compact(
            SORTED_SOCIAL_SOURCES.map((x) => {
                const currentProfile = currentProfileAll[x];
                return postId[x] && currentProfile
                    ? {
                          platform: resolveRedPacketPlatformType(x),
                          postId: postId[x]!,
                          handle: currentProfile.handle,
                      }
                    : null;
            }),
        );

        await FireflyRedPacket.updateClaimStrategy(
            rpPayloadFromMeta.rpid,
            reactions,
            claimPlatforms,
            postOn,
            rpPayload.publicKey,
        );
    }
}

async function setQueryDataForComment(post: CompositePost, updatedPost: CompositePost) {
    const source = post.availableSources[0];

    const parentPost = post.parentPost[source];
    if (!parentPost) return;

    const mockPost = createDummyCommentPost(source, updatedPost);
    const queryKey = ['posts', source, 'comments', parentPost.postId];

    if (mockPost) {
        queryClient.setQueriesData<{ pages: Array<{ data: Post[] }> }>({ queryKey }, (data) => {
            if (!data?.pages.length) return data;
            return produce(data, (draft) => {
                draft.pages[0].data.unshift(mockPost);
            });
        });
    }
    await queryClient.refetchQueries({ queryKey });
}

async function setQueryDataForQuote(post: CompositePost) {
    const source = post.availableSources[0];

    const parentPost = post.parentPost[source];
    if (!parentPost) return;

    const patched = produce(parentPost, (draft) => {
        draft.hasQuoted = true;
        draft.stats = {
            ...draft.stats!,
            quotes: (draft.stats?.quotes || 0) + 1,
        };
    });
    await queryClient.setQueryData([parentPost.source, 'post-detail', parentPost.postId], patched);
}

interface CrossPostOptions {
    isRetry?: boolean;
    // skip if post is already published
    skipIfPublishedPost?: boolean;
    // skip if no parent post is found in reply or quote
    skipIfNoParentPost?: boolean;
    // If it's a post in thread, only refresh the feeds after sending the last post.
    skipRefreshFeeds?: boolean;
    // skip check published result and showing success or error messages
    skipCheckPublished?: boolean;
    // skip report crossed post
    skipReportCrossedPost?: boolean;
}

export async function crossPost(
    type: ComposeType,
    compositePost: CompositePost,
    {
        isRetry = false,
        skipIfPublishedPost = false,
        skipIfNoParentPost = false,
        skipCheckPublished = false,
        skipRefreshFeeds = false,
        skipReportCrossedPost = false,
    }: CrossPostOptions = {},
) {
    const { updatePostInThread } = useComposeStateStore.getState();
    const { availableSources, poll, chars } = compositePost;

    // create common poll for farcaster and lens
    if (poll && SUPPORTED_FRAME_SOURCES.some((x) => availableSources.includes(x))) {
        const pollId = await commitPoll(poll, readChars(compositePost.chars));
        compositePost = {
            ...compositePost,
            chars: (Array.isArray(chars) ? chars : [chars]).map((x) => {
                if (typeof x !== 'string' && x.tag === CHAR_TAG.FRAME) {
                    return { ...x, id: pollId };
                }
                return x;
            }),
            poll: {
                ...poll,
                id: pollId,
            },
        };
    }

    const allSettled = await Promise.allSettled(
        SORTED_SOCIAL_SOURCES.map(async (source) => {
            if (!availableSources.includes(source)) return null;

            // post already published
            if (skipIfPublishedPost && compositePost.postId[source]) {
                return null;
            }

            // parent post is required for reply and quote
            if ((type === 'reply' || type === 'quote') && skipIfNoParentPost && !compositePost.parentPost[source]) {
                return null;
            }

            try {
                const result = await resolvePostTo(source)(type, compositePost);
                updatePostInThread(compositePost.id, (post) => ({
                    ...post,
                    postError: {
                        ...post.postError,
                        [source]: null,
                    },
                }));
                return result;
            } catch (error) {
                updatePostInThread(compositePost.id, (post) => ({
                    ...post,
                    postError: {
                        ...post.postError,
                        [source]: error instanceof Error ? error : new Error(`${error}`),
                    },
                }));
                throw error;
            }
        }),
    );

    const updatedCompositePost = getCompositePost(compositePost.id);
    if (!updatedCompositePost) throw new Error(`Post not found with id: ${compositePost.id}`);

    // check publish result
    if (!skipCheckPublished) {
        const failedPlatforms = failedAt(updatedCompositePost);

        if (failedPlatforms.length) {
            // the first error on each platform
            const allErrors = allSettled.map((x) => (x.status === 'rejected' ? x.reason : null));

            // show success message if no error found on certain platform
            SORTED_SOCIAL_SOURCES.forEach((x, i) => {
                const settled = allSettled[i];
                const error = settled.status === 'rejected' ? settled.reason : null;
                if (error) return;
                const rootPost = compositePost;
                if (!rootPost.availableSources.includes(x)) return;
                if (!isRetry) {
                    enqueueSuccessMessage(t`Your post have published successfully on ${resolveSourceName(x)}.`);
                }
            });

            const firstPlatform = failedPlatforms[0] ? resolveSourceName(failedPlatforms[0]) : '';
            const secondPlatform = failedPlatforms[1] ? resolveSourceName(failedPlatforms[1]) : '';

            const message = plural(failedPlatforms.length, {
                one: `Your post failed to publish on ${firstPlatform} due to an error. Click 'Retry' to attempt posting again.`,
                two: `Your post failed to publish on ${firstPlatform} and ${secondPlatform} due to an error. Click 'Retry' to attempt posting again.`,
                other: "Your post failed to publish due to an error. Click 'Retry' to attempt posting again.",
            });

            enqueueErrorsMessage(message, {
                errors: compact(allErrors),
                persist: true,
            });
            throw new Error(`Failed to post on: ${failedPlatforms.map(resolveSourceName).join(', ')}.`);
        } else {
            enqueueSuccessMessage(t`Your post has published successfully.`);
        }
    }

    // all failed
    if (allSettled.every((x) => x.status === 'rejected')) {
        throw new Error('Post failed to publish.');
    }

    // refresh profile feed
    if (!skipRefreshFeeds) {
        try {
            const staleSources = SORTED_SOCIAL_SOURCES.filter((source, i) => {
                const settled = allSettled[i];
                const postId = settled.status === 'fulfilled' ? settled.value : null;
                return availableSources.includes(source) && postId ? source : null;
            });

            await Promise.allSettled(staleSources.map((source) => refreshProfileFeed(source)));
        } catch (error) {
            console.error(`[cross post]: failed to refresh profile feed: ${error}`);
        }
    }

    // update red packet claim strategy
    try {
        await updateRpClaimStrategy(updatedCompositePost);
    } catch (error) {
        console.error(`[cross post]: failed to update red packet claim strategy: ${error}`);
    }

    // set query data
    try {
        if (type === 'reply') await setQueryDataForComment(compositePost, updatedCompositePost);
        if (type === 'quote') await setQueryDataForQuote(compositePost);
    } catch (error) {
        console.error(`[cross post]: failed to set query data: ${error}`);
    }

    // report crossed post
    if (!skipReportCrossedPost) reportCrossedPost(updatedCompositePost);

    return updatedCompositePost;
}
