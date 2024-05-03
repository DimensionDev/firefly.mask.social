import { ProfileIdentifier } from '@masknet/base';
import { safeUnreachable } from '@masknet/kit';
import type { IdentityResolved } from '@masknet/plugin-infra';

import { SocialPlatform } from '@/constants/enum.js';
import { SITE_HOSTNAME } from '@/constants/index.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

/**
 * Resolve firefly profile to masknet identity
 * @param source
 * @returns
 */
export async function resolveIdentity(source: SocialPlatform) {
    const currentProfileAll = getCurrentProfileAll();
    const identity: IdentityResolved = {};
    switch (source) {
        case SocialPlatform.Lens:
            const lensToken = await LensSocialMediaProvider.getAccessToken();
            identity.lensToken = lensToken.unwrap();
            identity.profileId = currentProfileAll.Lens?.profileId;
            identity.identifier = ProfileIdentifier.of(SITE_HOSTNAME, currentProfileAll.Lens?.handle).unwrapOr(
                undefined,
            );
            break;
        case SocialPlatform.Farcaster:
            const session = farcasterSessionHolder.session;
            if (!session) break;

            const { messageHash, messageSignature, signer } = await HubbleSocialMediaProvider.generateSignaturePacket();
            identity.farcasterMessage = messageHash;
            identity.farcasterSignature = messageSignature;
            identity.farcasterSigner = signer;
            identity.profileId = currentProfileAll.Farcaster?.profileId;
            identity.identifier = ProfileIdentifier.of(SITE_HOSTNAME, currentProfileAll.Farcaster?.handle).unwrap();
            break;
        case SocialPlatform.Twitter:
            identity.profileId = currentProfileAll.Twitter?.profileId;
            identity.identifier = ProfileIdentifier.of(SITE_HOSTNAME, currentProfileAll.Twitter?.handle).unwrap();
            break;
        default:
            safeUnreachable(source);
            break;
    }

    return identity;
}
