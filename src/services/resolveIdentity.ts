import { ProfileIdentifier } from '@masknet/base';
import { safeUnreachable } from '@masknet/kit';

import { type SocialSource, Source } from '@/constants/enum.js';
import { SITE_HOSTNAME } from '@/constants/index.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import type { IdentityResolved } from '@/mask/bindings/index.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { generateSignaturePacket } from '@/services/generateSignaturePacket.js';

/**
 * Resolve firefly profile to masknet identity
 * @param source
 * @returns
 */
export async function resolveIdentity(source: SocialSource) {
    const currentProfileAll = getCurrentProfileAll();
    const identity: IdentityResolved = {};
    switch (source) {
        case Source.Lens:
            const lensToken = await lensSessionHolder.sdk.authentication.getAccessToken();
            identity.lensToken = lensToken.unwrap();
            identity.profileId = currentProfileAll.Lens?.profileId;
            identity.identifier = ProfileIdentifier.of(SITE_HOSTNAME, currentProfileAll.Lens?.handle).unwrapOr(
                undefined,
            );
            break;
        case Source.Farcaster:
            const session = farcasterSessionHolder.session;
            if (!session) break;

            const { messageHash, messageSignature, signer } = await generateSignaturePacket();
            identity.farcasterMessage = messageHash;
            identity.farcasterSignature = messageSignature;
            identity.farcasterSigner = signer;
            identity.profileId = currentProfileAll.Farcaster?.profileId;
            identity.identifier = ProfileIdentifier.of(SITE_HOSTNAME, currentProfileAll.Farcaster?.handle).unwrap();
            break;
        case Source.Twitter:
            identity.profileId = currentProfileAll.Twitter?.profileId;
            identity.identifier = ProfileIdentifier.of(SITE_HOSTNAME, currentProfileAll.Twitter?.handle).unwrap();
            break;
        default:
            safeUnreachable(source);
            break;
    }

    return identity;
}
