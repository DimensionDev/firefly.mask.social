import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import { FireflyRedPacket } from '@masknet/web3-providers';
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { compact } from 'lodash-es';

import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';
import { hasRpPayload } from '@/helpers/hasPayload.js';
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

    const currentProfileAll = getCurrentProfileAll();

    if (hasRpPayload(typedMessage) && SORTED_SOURCES.some((x) => postId[x]) && rpPayload?.publicKey) {
        const rpPayloadFromMeta = typedMessage?.meta?.get(RedPacketMetaKey) as RedPacketJSONPayload;

        const reactions = compact(
            SORTED_SOURCES.map((x) => {
                const id = postId[x];
                return id
                    ? {
                          platform: resolveRedPacketPlatformType(x)!,
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
                          platformName: resolveRedPacketPlatformType(x)!,
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

export async function crossPost(type: ComposeType, compositePost: CompositePost) {
    const { availableSources } = compositePost;

    const allSettled = await Promise.allSettled(
        SORTED_SOURCES.map((x) =>
            availableSources.includes(x) ? resolvePostTo(x)(type, compositePost) : Promise.resolve(null),
        ),
    );
    if (allSettled.every((x) => x.status === 'rejected')) return;

    if (type === 'compose') {
        await Promise.allSettled(
            SORTED_SOURCES.map((x, i) => {
                const settled = allSettled[i];
                const post = settled.status === 'fulfilled' ? settled.value : null;
                return availableSources.includes(x) && post ? refreshProfileFeed(x) : Promise.resolve();
            }),
        );
    }

    // update red packet claim strategy if necessary
    const { posts } = useComposeStateStore.getState();
    const updatedCompositePost = posts.find((post) => post.id === compositePost.id);

    if (updatedCompositePost) await updateRpClaimStrategy(compositePost);
}
