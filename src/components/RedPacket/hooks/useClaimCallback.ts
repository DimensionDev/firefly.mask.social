import { useRedPacketConstants } from '@masknet/web3-shared-evm';
import { useAsyncFn } from 'react-use';
import { type Address } from 'viem';
import { getChainId, switchChain, writeContract } from 'wagmi/actions';

import { useCurrentClaimProfile } from '@/components/RedPacket/hooks/useCurrentClaimProfile.js';
import { useSignedMessage } from '@/components/RedPacket/hooks/useSignedMessage.js';
import { config } from '@/configs/wagmiClient.js';
import type { SocialSource } from '@/constants/enum.js';
import { resolveRedPacketPlatformType } from '@/helpers/resolveRedPacketPlatformType.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { HappyRedPacketV4ABI } from '@/mask/constants.js';
import { EVMChainResolver } from '@/mask/index.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';

/**
 * Claim fungible token red packet.
 */
export function useClaimCallback(
    account: string,
    payload: RedPacketJSONPayload = {} as RedPacketJSONPayload,
    source: SocialSource,
) {
    const payloadChainId = payload.token?.chainId;
    const rpid = payload.rpid;
    const { chainId: contextChainId } = useChainContext({ chainId: payloadChainId });
    const chainIdByName = EVMChainResolver.chainId('network' in payload ? payload.network! : '');
    const chainId = payloadChainId || chainIdByName || contextChainId;
    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(chainId);

    const { refetch } = useSignedMessage(account, payload, source);
    const { data: me } = useCurrentClaimProfile(source);

    return useAsyncFn(async () => {
        const globalChainId = getChainId(config);
        if (globalChainId !== chainId) await switchChain(config, { chainId });
        if (!redpacketContractAddress || !rpid) return;

        const claimWithSponsorHash = await runInSafeAsync(async () => {
            const sponsorable = await FireflyRedPacket.checkGasFreeStatus(chainId, account);
            if (!sponsorable || !me?.profileId) return;
            return FireflyRedPacket.claimForGasFree(rpid, account, {
                needLensAndFarcasterHandle: true,
                platform: resolveRedPacketPlatformType(source),
                profileId: me.profileId,
                handle: me?.handle,
                lensToken: me?.lensToken,
                farcasterMessage: me?.farcasterMessage as HexString,
                farcasterSigner: me?.farcasterSigner as HexString,
                farcasterSignature: me?.farcasterSignature as HexString,
            });
        });
        if (claimWithSponsorHash) return claimWithSponsorHash;

        const { data: signedMsg } = await refetch();
        if (!signedMsg) return;

        const hash = await writeContract(config, {
            abi: HappyRedPacketV4ABI,
            functionName: 'claim',
            args: [payload.rpid, signedMsg, account],
            address: redpacketContractAddress as Address,
            account: account as Address,
        });

        await waitForEthereumTransaction(chainId, hash);
        return hash;
    }, [chainId, redpacketContractAddress, rpid, refetch, payload.rpid, account, me, source]);
}
