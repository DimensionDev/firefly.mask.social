import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import { FireflyRedPacket } from '@masknet/web3-providers';
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { compact } from 'lodash-es';

import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';
import { hasRpPayload } from '@/helpers/hasPayload.js';
import { isPublishedPost } from '@/helpers/isPublishedPost.js';
import { resolvePostTo } from '@/helpers/resolvePostTo.js';
import { resolveRedPacketPlatformType } from '@/helpers/resolveRedPacketPlatformType.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

async function refreshProfileFeed(source: SocialPlatform) {
    const currentProfileAll = getCurrentProfileAll();

    await queryClient.invalidateQueries({
        queryKey: ['getPostsByProfileId', source, currentProfileAll[source]?.profileId],
    });
    queryClient.removeQueries({
        queryKey: ['getPostsByProfileId', source, currentProfileAll[source]?.profileId],
    });
}

async function updateRpClaimStrategy(compositePost: CompositePost) {
    const { postId, typedMessage, rpPayload } = compositePost;
    if (process.env.NODE_ENV === 'development') {
        if (rpPayload?.publicKey && !SORTED_SOURCES.some((x) => postId[x])) {
            console.error("No any post id for updating RedPacket's claim strategy.");
        }
    }

    if (hasRpPayload(typedMessage) && SORTED_SOURCES.some((x) => postId[x]) && rpPayload?.publicKey) {
        const currentProfileAll = getCurrentProfileAll();
        const rpPayloadFromMeta = typedMessage?.meta?.get(RedPacketMetaKey) as RedPacketJSONPayload;

        const reactions = compact(
            SORTED_SOURCES.map((x) => {
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
            SORTED_SOURCES.map((x) => {
                const currentProfile = currentProfileAll[x];
                return postId[x] && currentProfile
                    ? {
                          platformId: currentProfile.profileId,
                          platformName: resolveRedPacketPlatformType(x),
                      }
                    : null;
            }),
        );

        await FireflyRedPacket.updateClaimStrategy(
            rpPayloadFromMeta.rpid,
            reactions,
            claimPlatforms,
            rpPayload.publicKey,
        );
    }
}

interface CrossPostOptions {
    // skip if post is already published
    skipIfPublishedPost?: boolean;
    // skip if no parent post is found in reply or quote
    skipIfNoParentPost?: boolean;
    // skip published check
    skipPublishedCheck?: boolean;
}

export async function crossPost(
    type: ComposeType,
    compositePost: CompositePost,
    { skipIfPublishedPost = false, skipIfNoParentPost = false, skipPublishedCheck = false }: CrossPostOptions = {},
) {
    const { availableSources } = compositePost;

    const allSettled = await Promise.allSettled(
        SORTED_SOURCES.map((x) => {
            if (availableSources.includes(x)) {
                // post already published
                if (skipIfPublishedPost && compositePost.postId[x]) {
                    return Promise.resolve(null);
                }

                // parent post is required for reply and quote
                if ((type === 'reply' || type === 'quote') && skipIfNoParentPost && !compositePost.parentPost[x]) {
                    return Promise.resolve(null);
                }
                return resolvePostTo(x)(type, compositePost);
            } else {
                return Promise.resolve(null);
            }
        }),
    );

    // failed to cross post
    if (allSettled.every((x) => x.status === 'rejected')) {
        throw new Error('Post failed to publish.');
    }

    // refresh profile feed
    if (type === 'compose') {
        await Promise.allSettled(
            SORTED_SOURCES.map((x, i) => {
                const settled = allSettled[i];
                const post = settled.status === 'fulfilled' ? settled.value : null;
                return availableSources.includes(x) && post ? refreshProfileFeed(x) : Promise.resolve();
            }),
        );
    }

    const { posts } = useComposeStateStore.getState();
    const updatedCompositePost = posts.find((post) => post.id === compositePost.id);
    if (!updatedCompositePost) throw new Error('Post not found.');

    // failed to to cross post
    if (!skipPublishedCheck && !isPublishedPost(type, updatedCompositePost)) {
        throw new Error('Post failed to publish.');
    }

    // update red packet claim strategy
    await updateRpClaimStrategy(updatedCompositePost);
}
