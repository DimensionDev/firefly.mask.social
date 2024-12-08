import { ContractTransaction } from '@masknet/web3-shared-evm';
import { useAsyncFn } from 'react-use';
import { type Hex, keccak256 } from 'viem';

import { useChainContext } from '@/hooks/useChainContext.js';
import type { HappyRedPacketV1, HappyRedPacketV4 } from '@/mask/bindings/constants.js';
import { EVMChainResolver, EVMWeb3 } from '@/mask/bindings/index.js';
import { useRedPacketContract } from '@/mask/plugins/red-packet/hooks/useRedPacketContract.js';
import { useSignedMessage } from '@/mask/plugins/red-packet/hooks/useSignedMessage.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';

/**
 * Claim fungible token red packet.
 */
export function useClaimCallback(account: string, payload: RedPacketJSONPayload = {} as RedPacketJSONPayload) {
    const payloadChainId = payload.token?.chainId;
    const version = payload.contract_version;
    const rpid = payload.rpid;
    const { chainId: contextChainId } = useChainContext({ chainId: payloadChainId });
    const chainIdByName = EVMChainResolver.chainId('network' in payload ? payload.network! : '');
    const chainId = payloadChainId || chainIdByName || contextChainId;
    const redPacketContract = useRedPacketContract(chainId, version);
    const { refetch } = useSignedMessage(account, payload);
    return useAsyncFn(async () => {
        if (!redPacketContract || !rpid) return;
        const sponsorable = await FireflyRedPacket.checkGasFreeStatus(account, chainId);
        if (sponsorable) {
            const hash = await FireflyRedPacket.claimForGasFree(rpid, account);
            return hash;
        }
        const { data: signedMsg } = await refetch();
        if (!signedMsg) return;
        const config = {
            from: account,
        };
        // note: despite the method params type of V1 and V2 is the same,
        // but it is more understandable to declare respectively
        const contractTransaction = new ContractTransaction(redPacketContract);
        const tx =
            version === 4
                ? await contractTransaction.fillAll(
                      (redPacketContract as HappyRedPacketV4).methods.claim(rpid, signedMsg, account),
                      config,
                  )
                : await contractTransaction.fillAll(
                      (redPacketContract as HappyRedPacketV1).methods.claim(
                          rpid,
                          signedMsg,
                          account,
                          keccak256(account as Hex),
                      ),
                      config,
                  );

        return EVMWeb3.sendTransaction(tx, {
            chainId,
        });
    }, [rpid, account, chainId, redPacketContract, version, refetch]);
}
