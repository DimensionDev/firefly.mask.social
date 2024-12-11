import { useQuery } from '@tanstack/react-query';

import { type SocialSource, Source } from '@/constants/enum.js';
import { SITE_HOSTNAME } from '@/constants/index.js';
import { resolveRedPacketPlatformType } from '@/helpers/resolveRedPacketPlatformType.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { ProfileIdentifier } from '@/mask/bindings/index.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import type { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';
import { generateSignaturePacket } from '@/services/generateSignaturePacket.js';

export function useCurrentClaimProfile(source: SocialSource) {
    const { currentProfile } = useProfileStore(source);

    return useQuery({
        queryKey: ['red-packet', 'current-claim-profile', source, currentProfile],
        queryFn: async () => {
            const platform = resolveRedPacketPlatformType(source);

            if (!platform || !currentProfile) return;
            const identifier = ProfileIdentifier.of(SITE_HOSTNAME, currentProfile?.handle).unwrapOr(undefined);

            const profile = platform
                ? ({
                      needLensAndFarcasterHandle: true,
                      platform,
                      profileId: currentProfile?.profileId,
                      handle: identifier?.userId,
                  } as FireflyRedPacketAPI.CheckClaimStrategyStatusOptions['profile'])
                : undefined;

            if (source === Source.Lens)
                return {
                    ...profile,
                    lensToken: (await lensSessionHolder.sdk.authentication.getAccessToken()).unwrap(),
                } as FireflyRedPacketAPI.CheckClaimStrategyStatusOptions['profile'];
            if (source === Source.Farcaster && farcasterSessionHolder.session) {
                const { messageHash, messageSignature, signer } = await generateSignaturePacket();

                return {
                    ...profile,
                    farcasterMessage: messageHash,
                    farcasterSignature: messageSignature,
                    farcasterSigner: signer,
                } as FireflyRedPacketAPI.CheckClaimStrategyStatusOptions['profile'];
            }

            return profile as FireflyRedPacketAPI.CheckClaimStrategyStatusOptions['profile'];
        },
    });
}
