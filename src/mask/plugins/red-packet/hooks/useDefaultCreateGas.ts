import { toFixed, ZERO } from '@masknet/web3-shared-base';
import { SchemaType, useTokenConstants } from '@masknet/web3-shared-evm';
import { omit } from 'lodash-es';
import { useAsync } from 'react-use';
import { type Hex, keccak256 } from 'viem';

import { useChainContext } from '@/hooks/useChainContext.js';
import type { HappyRedPacketV4 } from '@/mask/bindings/constants.js';
import {
    checkParams,
    type MethodParameters,
    type ParamsObjType,
    type RedPacketSettings,
} from '@/mask/plugins/red-packet/hooks/useCreateCallback.js';
import { useRedPacketContract } from '@/mask/plugins/red-packet/hooks/useRedPacketContract.js';

export function useDefaultCreateGas(
    redPacketSettings: RedPacketSettings | undefined,
    version: number,
    publicKey: string,
) {
    const { account, chainId } = useChainContext();
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId);
    const redPacketContract = useRedPacketContract(chainId, version);

    return useAsync(async () => {
        if (!redPacketSettings || !redPacketContract) return ZERO;
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

        return (redPacketContract as HappyRedPacketV4).methods
            .create_red_packet(...params)
            .estimateGas({ from: account, value });
    }, [JSON.stringify(redPacketSettings), account, redPacketContract, publicKey, version, NATIVE_TOKEN_ADDRESS]);
}
