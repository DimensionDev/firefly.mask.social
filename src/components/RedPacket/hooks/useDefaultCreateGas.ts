import { toFixed } from '@masknet/web3-shared-base';
import { SchemaType, useRedPacketConstants, useTokenConstants } from '@masknet/web3-shared-evm';
import { BigNumber } from 'bignumber.js';
import { omit } from 'lodash-es';
import { useAsync } from 'react-use';
import { type Address, type Hex, keccak256 } from 'viem';

import {
    checkParams,
    type MethodParameters,
    type ParamsObjType,
    type RedPacketSettings,
} from '@/components/RedPacket/hooks/useCreateCallback.js';
import { createPublicViemClient } from '@/helpers/createPublicViemClient.js';
import { ZERO } from '@/helpers/number.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { type ChainContextOverride, useChainContext } from '@/hooks/useChainContext.js';
import { HappyRedPacketV4ABI } from '@/mask/constants.js';

export function useDefaultCreateGas(
    redPacketSettings: RedPacketSettings | undefined,
    version: number,
    publicKey: string,
    override?: ChainContextOverride,
) {
    const { account, chainId } = useChainContext(override);
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId);

    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(chainId);

    return useAsync(async () => {
        if (!redPacketSettings || !redpacketContractAddress) return ZERO;
        const { duration, isRandom, message, name, shares, total, token } = redPacketSettings;
        if (!token) return ZERO;
        const seed = Math.random().toString();
        const tokenType = token!.schema === SchemaType.Native ? 0 : 1;
        const tokenAddress = token!.schema === SchemaType.Native ? NATIVE_TOKEN_ADDRESS : token!.address;
        if (!tokenAddress) {
            return ZERO;
        }

        const paramsObj: ParamsObjType = {
            publicKey,
            shares,
            isRandom,
            duration,
            seed: keccak256(seed as Hex),
            message,
            name,
            tokenType,
            tokenAddress,
            total,
            token,
        };

        try {
            checkParams(paramsObj);
        } catch {
            return ZERO;
        }

        const params = Object.values(omit(paramsObj, ['token'])) as MethodParameters;

        const value = toFixed(paramsObj.token?.schema === SchemaType.Native ? total : 0);

        const client = createPublicViemClient(chainId);
        const result = await runInSafeAsync(async () => {
            return client.estimateContractGas({
                address: redpacketContractAddress as Address,
                abi: HappyRedPacketV4ABI,
                functionName: 'create_red_packet',
                args: params,
                value: BigInt(value),
                account: account as Address,
            });
        });

        return result ? new BigNumber(result.toString()) : ZERO;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        chainId,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(redPacketSettings),
        account,
        redpacketContractAddress,
        publicKey,
        version,
        NATIVE_TOKEN_ADDRESS,
    ]);
}
