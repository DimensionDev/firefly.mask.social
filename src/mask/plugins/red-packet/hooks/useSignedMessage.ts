import { signMessage } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { type SocialSource } from '@/constants/enum.js';
import { useCurrentClaimProfile } from '@/mask/plugins/red-packet/hooks/useCurrentClaimProfile.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';

export function useSignedMessage(
    account: string,
    payload: RedPacketJSONPayload = {} as RedPacketJSONPayload,
    source: SocialSource,
) {
    const rpid = payload.rpid;
    const password = 'privateKey' in payload ? payload.privateKey : payload.password;
    const version = payload.contract_version;
    const { data: profile } = useCurrentClaimProfile(source);

    return useQuery({
        enabled: !!profile,
        queryKey: ['red-packet', 'signed-message', rpid, version, password, account, profile],
        queryFn: async () => {
            if (version <= 3) return password as string;
            if (password) return signMessage(account, password as string).signature;
            if (!profile || !account) return '';

            return FireflyRedPacket.createClaimSignature({
                rpid,
                profile,
                wallet: {
                    address: account,
                },
            });
        },
    });
}
