import { useLastRecognizedIdentity, usePostInfoDetails } from '@masknet/plugin-infra/content-script';
import { EnhanceableSite } from '@masknet/shared-base';
import type { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { useChainContext } from '@/hooks/useChainContext.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import type { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

/**
 * Parse RedPacket with post info.
 * Firefly only.
 */
export function useParseRedPacket(chainId: ChainId) {
    const images = usePostInfoDetails.postMetadataImages();
    const { account } = useChainContext({
        chainId,
    });
    const source = usePostInfoDetails.source();
    const me = useLastRecognizedIdentity();
    const myProfileId = me?.profileId;
    const site = usePostInfoDetails.site();
    const isOnFirefly = site === EnhanceableSite.Firefly;

    const query = useQuery({
        enabled: images.length > 0 && isOnFirefly,
        queryKey: ['red-packet', 'parse', source, images[0], account],
        queryFn: async () => {
            const platform = source?.toLowerCase() as FireflyRedPacketAPI.PlatformType;
            return FireflyRedPacket.parse({
                image: {
                    imageUrl: images[0],
                },
                walletAddress: account,
                platform,
                profileId: myProfileId,
            });
        },
    });
    return query.data;
}
