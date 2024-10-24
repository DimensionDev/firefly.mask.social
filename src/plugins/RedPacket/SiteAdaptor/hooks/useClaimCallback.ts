import type { NetworkPluginID } from '@masknet/shared-base';
import { useChainContext } from '@masknet/web3-hooks-base';
import { EVMChainResolver, EVMWeb3 } from '@masknet/web3-providers';
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { ContractTransaction } from '@masknet/web3-shared-evm';
import { useAsyncFn } from 'react-use';

import type { HappyRedPacketV4 } from '@/plugins/RedPacket/HappyRedPacket.js';
import { useRedPacketContract } from '@/plugins/RedPacket/SiteAdaptor/hooks/useRedPacketContract.js';
import { useSignedMessage } from '@/plugins/RedPacket/SiteAdaptor/hooks/useSignedMessage.js';

/**
 * Claim fungible token red packet.
 */
export function useClaimCallback(account: string, payload: RedPacketJSONPayload = {} as RedPacketJSONPayload) {
    const payloadChainId = payload.token?.chainId;
    const version = payload.contract_version;
    const rpid = payload.rpid;
    const { chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: payloadChainId });
    const chainIdByName = EVMChainResolver.chainId('network' in payload ? payload.network! : '');
    const chainId = payloadChainId || chainIdByName || contextChainId;
    const redPacketContract = useRedPacketContract(chainId, version);
    const { refetch } = useSignedMessage(account, payload);
    return useAsyncFn(async () => {
        if (!redPacketContract || !rpid) return;
        const { data: signedMsg } = await refetch();
        if (!signedMsg) return;
        const config = {
            from: account,
        };
        // note: despite the method params type of V1 and V2 is the same,
        // but it is more understandable to declare respectively
        const contractTransaction = new ContractTransaction(redPacketContract);
        const tx = await contractTransaction.fillAll(
            (redPacketContract as HappyRedPacketV4).methods.claim(rpid, signedMsg, account),
            config,
        );

        return EVMWeb3.sendTransaction(tx, {
            chainId,
        });
    }, [rpid, account, chainId, redPacketContract, version, refetch]);
}
