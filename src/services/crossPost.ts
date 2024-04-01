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
    const { currentProfile: currentTwitterProfile } = useTwitterStateStore.getState();

    const { postId, typedMessage, rpPayload } = compositePost;

    const lensPostId = postId[SocialPlatform.Lens];
    const farcasterPostId = postId[SocialPlatform.Farcaster];
    const twitterPostId = postId[SocialPlatform.Twitter];

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
            twitterPostId
                ? {
                      platform: FireflyRedPacketAPI.PlatformType.twitter,
                      postId: twitterPostId,
                      handle: currentTwitterProfile?.handle,
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
            twitterPostId && currentTwitterProfile
                ? {
                      platformId: currentTwitterProfile.profileId,
                      platformName: FireflyRedPacketAPI.PlatformType.twitter,
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

    const useFarcaster = availableSources.includes(SocialPlatform.Farcaster);
    const useLens = availableSources.includes(SocialPlatform.Lens);
    const useTwitter = availableSources.includes(SocialPlatform.Twitter);

    const allSettled = await Promise.allSettled([
        useFarcaster ? postToFarcaster(type, compositePost) : Promise.resolve(null),
        useLens ? postToLens(type, compositePost) : Promise.resolve(null),
        useTwitter ? postToTwitter(type, compositePost) : Promise.resolve(null),
    ]);
    if (allSettled.every((x) => x.status === 'rejected')) return;

    if (type === 'compose') {
        const [farcasterPost, lensPost, twitterPost] = allSettled.map((x) =>
            x.status === 'fulfilled' ? x.value : null,
        );

        await Promise.allSettled([
            useFarcaster && farcasterPost ? refreshProfileFeed(SocialPlatform.Farcaster) : Promise.resolve(),
            useLens && lensPost ? refreshProfileFeed(SocialPlatform.Lens) : Promise.resolve(),
            useTwitter && twitterPost ? refreshProfileFeed(SocialPlatform.Twitter) : Promise.resolve(),
        ]);
    }

    // update red packet claim strategy if necessary
    const { posts } = useComposeStateStore.getState();
    const updatedCompositePost = posts.find((post) => post.id === compositePost.id);

    if (updatedCompositePost) await updateRpClaimStrategy(compositePost);
}
