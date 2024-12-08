import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script';
import { useQuery } from '@tanstack/react-query';

import { useChainContext } from '@/hooks/useChainContext.js';
import { usePlatformType } from '@/mask/plugins/red-packet/hooks/usePlatformType.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';

export function useClaimStrategyStatus(payload: RedPacketJSONPayload) {
    const platform = usePlatformType();
    const rpid = payload.rpid;

    const { account } = useChainContext({
        chainId: payload.chainId,
    });
    const signedMessage = 'privateKey' in payload ? payload.privateKey : payload.password;
    const me = useLastRecognizedIdentity();
    return useQuery({
        enabled: !signedMessage && !!platform,
        queryKey: ['red-packet', 'claim-strategy', rpid, platform, account, me],
        queryFn: async () => {
            if (!platform || !account) return null;
            return FireflyRedPacket.checkClaimStrategyStatus({
                rpid,
                profile: {
                    needLensAndFarcasterHandle: true,
                    platform,
                    profileId: me?.profileId,
                    lensToken: me?.lensToken,
                    farcasterMessage: me?.farcasterMessage as HexString,
                    farcasterSigner: me?.farcasterSigner as HexString,
                    farcasterSignature: me?.farcasterSignature as HexString,
                },
                wallet: {
                    address: account,
                },
            });
        },
    });
}
