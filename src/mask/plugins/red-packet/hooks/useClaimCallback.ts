import { useRedPacketConstants } from '@masknet/web3-shared-evm';
import { useAsyncFn } from 'react-use';
import { type Address } from 'viem';
import { getChainId, switchChain, writeContract } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import type { SocialSource } from '@/constants/enum.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { HappyRedPacketV4ABI } from '@/mask/bindings/constants.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import { useSignedMessage } from '@/mask/plugins/red-packet/hooks/useSignedMessage.js';
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';

/**
 * Claim fungible token red packet.
 */
export function useClaimCallback(
    account: string,
    payload: RedPacketJSONPayload = {} as RedPacketJSONPayload,
    source: SocialSource,
) {
    const payloadChainId = payload.token?.chainId;
    const version = payload.contract_version;
    const rpid = payload.rpid;
    const { chainId: contextChainId } = useChainContext({ chainId: payloadChainId });
    const chainIdByName = EVMChainResolver.chainId('network' in payload ? payload.network! : '');
    const chainId = payloadChainId || chainIdByName || contextChainId;
    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(chainId);

    const { refetch } = useSignedMessage(account, payload, source);

    return useAsyncFn(async () => {
        const globalChainId = getChainId(config);
        if (globalChainId !== chainId) await switchChain(config, { chainId });

        if (!redpacketContractAddress || !rpid) return;
        const sponsorable = await FireflyRedPacket.checkGasFreeStatus(account, chainId);
        if (sponsorable) {
            const hash = await FireflyRedPacket.claimForGasFree(rpid, account);
            return hash;
        }
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
    }, [rpid, account, chainId, redpacketContractAddress, version, refetch]);
}
