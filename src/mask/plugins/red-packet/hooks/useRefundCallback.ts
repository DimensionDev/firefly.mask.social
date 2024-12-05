import type { NetworkPluginID } from '@masknet/shared-base';
import { useChainContext } from '@/hooks/useChainContext.js';
import { type ChainId, ContractTransaction } from '@masknet/web3-shared-evm';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

import { EVMWeb3 } from '@/mask/bindings/index.js';
import { useRedPacketContract } from '@/mask/plugins/red-packet/hooks/useRedPacketContract.js';

export function useRefundCallback(version: number, from: string, id?: string, expectedChainId?: ChainId) {
    const { chainId } = useChainContext({ chainId: expectedChainId });
    const [isRefunded, setIsRefunded] = useState(false);
    const redPacketContract = useRedPacketContract(chainId, version);

    const [state, refundCallback] = useAsyncFn(async () => {
        if (!redPacketContract || !id) return;

        setIsRefunded(false);
        console.log(redPacketContract);
        const tx = await new ContractTransaction(redPacketContract).fillAll(redPacketContract.methods.refund(id), {
            from,
        });
        const hash = await EVMWeb3.sendTransaction(tx, {
            chainId,
        });
        setIsRefunded(true);
        return hash;
    }, [id, redPacketContract, chainId, from]);

    return [state, isRefunded, refundCallback] as const;
}
