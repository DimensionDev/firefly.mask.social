import { safeUnreachable } from '@masknet/kit';
import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import { FireflyRedPacket } from '@masknet/web3-providers';
import { FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { compact } from 'lodash-es';

import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { hasRpPayload } from '@/helpers/hasPayload.js';
import { postToFarcaster } from '@/services/postToFarcaster.js';
import { postToLens } from '@/services/postToLens.js';
import { postToTwitter } from '@/services/postToTwitter.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';
import type { ComposeType } from '@/types/compose.js';

async function refreshProfileFeed(source: SocialPlatform) {
    const { currentProfile: currentLensProfile } = useLensStateStore.getState();
    const { currentProfile: currentFarcasterProfile } = useFarcasterStateStore.getState();
    const { currentProfile: currentTwitterProfile } = useTwitterStateStore.getState();

    switch (source) {
        case SocialPlatform.Lens:
            await queryClient.invalidateQueries({
                queryKey: ['getPostsByProfileId', SocialPlatform.Lens, currentLensProfile?.profileId],
            });
            queryClient.removeQueries({
                queryKey: ['getPostsByProfileId', SocialPlatform.Lens, currentLensProfile?.profileId],
            });
            break;
        case SocialPlatform.Farcaster:
            await queryClient.invalidateQueries({
                queryKey: ['getPostsByProfileId', SocialPlatform.Farcaster, currentFarcasterProfile?.profileId],
            });
            queryClient.removeQueries({
                queryKey: ['getPostsByProfileId', SocialPlatform.Farcaster, currentFarcasterProfile?.profileId],
            });
            break;
        case SocialPlatform.Twitter:
            await queryClient.invalidateQueries({
                queryKey: ['getPostsByProfileId', SocialPlatform.Twitter, currentTwitterProfile?.profileId],
            });
            queryClient.removeQueries({
                queryKey: ['getPostsByProfileId', SocialPlatform.Twitter, currentTwitterProfile?.profileId],
            });
            break;
        default:
            safeUnreachable(source);
            return;
    }
}

async function updateRpClaimStrategy(compositePost: CompositePost) {
    const { currentProfile: currentLensProfile } = useLensStateStore.getState();
    const { currentProfile: currentFarcasterProfile } = useFarcasterStateStore.getState();

    const { postId, typedMessage, rpPayload } = compositePost;

    const lensPostId = postId[SocialPlatform.Lens];
    const farcasterPostId = postId[SocialPlatform.Farcaster];

    if (hasRpPayload(typedMessage) && (lensPostId || farcasterPostId) && rpPayload?.publicKey) {
        const rpPayloadFromMeta = typedMessage?.meta?.get(RedPacketMetaKey) as RedPacketJSONPayload;

        const reactions = compact([
            lensPostId
                ? {
                      platform: FireflyRedPacketAPI.PlatformType.lens,
                      postId: lensPostId,
                  }
                : undefined,
            farcasterPostId
                ? {
                      platform: FireflyRedPacketAPI.PlatformType.farcaster,
                      postId: farcasterPostId,
                      handle: currentFarcasterProfile?.handle,
                  }
                : undefined,
        ]);

        const claimPlatform = compact([
            lensPostId && currentLensProfile
                ? {
                      platformId: currentLensProfile.profileId,
                      platformName: FireflyRedPacketAPI.PlatformType.lens,
                  }
                : undefined,
            farcasterPostId && currentFarcasterProfile
                ? {
                      platformId: currentFarcasterProfile.profileId,
                      platformName: FireflyRedPacketAPI.PlatformType.farcaster,
                  }
                : undefined,
        ]);
        await FireflyRedPacket.updateClaimStrategy(
            rpPayloadFromMeta.rpid,
            reactions,
            claimPlatform,
            rpPayload.publicKey,
        );
    }
}

export async function crossPost(type: ComposeType, compositePost: CompositePost) {
    const { availableSources } = compositePost;

    if (type === 'compose') {
        const promises: Array<Promise<string>> = [];
        if (availableSources.includes(SocialPlatform.Farcaster))
            promises.push(postToFarcaster('compose', compositePost));
        if (availableSources.includes(SocialPlatform.Lens)) promises.push(postToLens('compose', compositePost));

        const allSettled = await Promise.allSettled(promises);

        // If all requests fail, abort execution
        if (allSettled.every((x) => x.status === 'rejected')) return;

        if (availableSources.includes(SocialPlatform.Farcaster)) await refreshProfileFeed(SocialPlatform.Farcaster);
        if (availableSources.includes(SocialPlatform.Lens)) await refreshProfileFeed(SocialPlatform.Lens);
        if (availableSources.includes(SocialPlatform.Lens)) await refreshProfileFeed(SocialPlatform.Twitter);
    } else {
        if (availableSources.includes(SocialPlatform.Farcaster)) await postToFarcaster(type, compositePost);
        if (availableSources.includes(SocialPlatform.Lens)) await postToLens(type, compositePost);
        if (availableSources.includes(SocialPlatform.Twitter)) await postToTwitter(type, compositePost);
    }

    // update red packet claim strategy if necessary
    const { posts } = useComposeStateStore.getState();
    const updatedCompositePost = posts.find((post) => post.id === compositePost.id);

    if (updatedCompositePost) await updateRpClaimStrategy(compositePost);
}
