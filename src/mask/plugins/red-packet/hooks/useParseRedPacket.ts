import type { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import type { SocialSource } from '@/constants/enum.js';
import { resolveRedPacketPlatformType } from '@/helpers/resolveRedPacketPlatformType.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';

/**
 * Parse RedPacket with post info.
 * Firefly only.
 */
export function useParseRedPacket(chainId: ChainId, source: SocialSource, image?: string) {
    const { account } = useChainContext({
        chainId,
    });
    const { currentProfile } = useProfileStore(source);

    const query = useQuery({
        enabled: !!image,
        queryKey: ['red-packet', 'parse', source, image, account, currentProfile?.profileId],
        queryFn: async () => {
            if (!image) return;
            return FireflyRedPacket.parse({
                image: {
                    imageUrl: image,
                },
                walletAddress: account,
                platform: resolveRedPacketPlatformType(source),
                profileId: currentProfile?.profileId,
            });
        },
    });
    return query.data;
}
