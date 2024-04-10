import { ProfileIdentifier } from '@masknet/base';
import type { IdentityResolved } from '@masknet/plugin-infra';

import { farcasterClient } from '@/configs/farcasterClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SITE_HOSTNAME } from '@/constants/index.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

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
            const session = farcasterClient.getSession();
            if (!session) break;

            const { messageHash, messageSignature, signer } = await HubbleSocialMediaProvider.generateSignaturePacket();
            identity.farcasterMessage = messageHash;
            identity.farcasterSignature = messageSignature;
            identity.farcasterSigner = signer;
            identity.profileId = currentProfileAll.Farcaster?.profileId;
            identity.identifier = ProfileIdentifier.of(SITE_HOSTNAME, currentProfileAll.Farcaster?.handle).unwrap();
            break;
        default:
            break;
    }

    return identity;
}
