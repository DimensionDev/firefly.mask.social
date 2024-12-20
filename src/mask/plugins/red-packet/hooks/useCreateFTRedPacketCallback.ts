import { formatBalance } from '@masknet/web3-shared-base';
import { type GasConfig, isNativeTokenAddress, useRedPacketConstants } from '@masknet/web3-shared-evm';
import { BigNumber } from 'bignumber.js';
import { useCallback, useEffect, useRef } from 'react';
import { useBalance } from 'wagmi';

import { useChainContext } from '@/hooks/useChainContext.js';
import { useTransactionValue } from '@/mask/bindings/hooks.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import {
    type RedPacketSettings,
    useCreateCallback,
    useCreateParams,
} from '@/mask/plugins/red-packet/hooks/useCreateCallback.js';
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';

export function useCreateFTRedPacketCallback(
    publicKey: string,
    privateKey: string,
    settings: RedPacketSettings,
    gasOption?: GasConfig,
    onCreated?: (payload: RedPacketJSONPayload) => void,
    onClose?: () => void,
    currentAccount?: string,
) {
    // password should remain the same rather than change each time when createState change,
    //  otherwise password in database would be different from creating red-packet.
    const contract_version = 4;

    const { chainId, account } = useChainContext();
    const { value: createParams } = useCreateParams(chainId, settings, contract_version, publicKey);
    const isNativeToken = isNativeTokenAddress(settings.token?.address);
    const { transactionValue, estimateGasFee } = useTransactionValue(
        settings.total,
        createParams?.gas,
        gasOption?.gasCurrency,
    );

    const { isLoading } = useBalance();
    const isWaitGasBeMinus = (!estimateGasFee || isLoading) && isNativeToken;

    const isBalanceInsufficient =
        isNativeTokenAddress(gasOption?.gasCurrency) && new BigNumber(transactionValue).isLessThanOrEqualTo(0);

    const total = isNativeToken ? (isBalanceInsufficient ? '0' : transactionValue) : (settings?.total as string);

    const formatTotal = formatBalance(total, settings?.token?.decimals ?? 18, { significant: isNativeToken ? 3 : 0 });
    const formatAvg = formatBalance(
        new BigNumber(total).div(settings?.shares ?? 1).toFixed(0, 1),
        settings?.token?.decimals ?? 18,
        { significant: isNativeToken ? 3 : 0 },
    );

    const [{ loading: isCreating }, createCallback] = useCreateCallback(
        chainId,
        { ...settings!, total, name: currentAccount || settings.name },
        contract_version,
        publicKey,
        gasOption,
    );

    const createRedPacket = useCallback(async () => {
        const result = await createCallback();
        const { hash, receipt, events } = result ?? {};
        if (typeof hash !== 'string') return;
        if (typeof receipt?.transactionHash !== 'string') return;

        // the settings is not available
        if (!settings?.token) return;

        const CreationSuccess = (events?.CreationSuccess?.returnValues ?? {}) as {
            creation_time: string;
            creator: string;
            id: string;
            token_address: string;
            total: string;
        };

        // the events log is not available
        if (!events?.CreationSuccess?.returnValues.id) return;

        payload.current.sender = {
            address: account,
            name: currentAccount || settings.name,
            message: settings.message,
        };
        payload.current.is_random = settings.isRandom;
        payload.current.shares = settings.shares;
        payload.current.password = privateKey;
        payload.current.rpid = CreationSuccess.id;
        payload.current.total = CreationSuccess.total;
        payload.current.duration = settings.duration;
        payload.current.creation_time = Number.parseInt(CreationSuccess.creation_time, 10) * 1000;
        payload.current.token = settings.token;

        // output the redpacket as JSON payload
        onCreated?.(payload.current);
    }, [
        createCallback,
        settings.token,
        settings.name,
        settings.message,
        settings.isRandom,
        settings.shares,
        settings.duration,
        account,
        currentAccount,
        privateKey,
        onCreated,
    ]);

    const payload = useRef<RedPacketJSONPayload>({
        network: EVMChainResolver.chainName(chainId),
    } as RedPacketJSONPayload);

    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId);

    useEffect(() => {
        const contractAddress = HAPPY_RED_PACKET_ADDRESS_V4;
        if (!contractAddress) {
            onClose?.();
            return;
        }
        payload.current.contract_address = contractAddress;
        payload.current.contract_version = contract_version;
        payload.current.network = EVMChainResolver.networkType(chainId);
    }, [chainId, contract_version, HAPPY_RED_PACKET_ADDRESS_V4, onClose]);

    return {
        createRedPacket,
        isCreating,
        formatAvg,
        formatTotal,
        isBalanceInsufficient,
        isWaitGasBeMinus,
        gas: createParams?.gas,
        estimateGasFee,
    };
}
