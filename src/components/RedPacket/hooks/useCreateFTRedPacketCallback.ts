import { t } from '@lingui/macro';
import { type FungibleToken, toFixed } from '@masknet/web3-shared-base';
import { ChainId, SchemaType, useRedPacketConstants, useTokenConstants } from '@masknet/web3-shared-evm';
import { first, omit, pick } from 'lodash-es';
import { useContext, useMemo } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';
import { type Address, decodeEventLog, type Hex, keccak256, parseEventLogs } from 'viem';
import { getTransactionReceipt, writeContract } from 'wagmi/actions';

import {
    checkParams,
    type MethodParameters,
    type ParamsObjType,
} from '@/components/RedPacket/hooks/useCreateCallback.js';
import { config } from '@/configs/wagmiClient.js';
import { EMPTY_LIST, SITE_URL } from '@/constants/index.js';
import {
    DEFAULT_THEME_ID,
    RED_PACKET_CONTRACT_VERSION,
    RED_PACKET_DURATION,
    RedPacketMetaKey,
} from '@/constants/rp.js';
import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getTypedMessageRedPacket } from '@/helpers/getTypedMessage.js';
import { rightShift } from '@/helpers/number.js';
import { getRpMetadata } from '@/helpers/rpPayload.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { HappyRedPacketV4ABI } from '@/mask/constants.js';
import { EVMChainResolver } from '@/mask/index.js';
import { RedPacketModalRef } from '@/modals/controls.js';
import { RedPacketContext } from '@/modals/RedPacketModal/RedPacketContext.js';
import type { FireflyRedPacketAPI, RedPacketJSONPayload } from '@/providers/red-packet/types.js';
import { captureLuckyDropEvent } from '@/providers/telemetry/captureLuckyDropEvent.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

function reduceUselessPayloadInfo(payload: RedPacketJSONPayload): RedPacketJSONPayload {
    const token = pick(payload.token, ['decimals', 'symbol', 'address', 'chainId']) as FungibleToken<
        ChainId,
        SchemaType.Native | SchemaType.ERC20
    >;
    return { ...omit(payload, ['block_number']), token };
}

export function useCreateFTRedPacketCallback(
    shareFromName: string,
    publicKey: string,
    claimRequirements?: FireflyRedPacketAPI.StrategyPayload[],
) {
    const { randomType, message, shares, token, totalAmount, theme } = useContext(RedPacketContext);

    const redPacketSettings = useMemo(() => {
        return {
            duration: RED_PACKET_DURATION,
            isRandom: randomType === 'random',
            name: shareFromName,
            message: message || t`Best Wishes!`,
            shares: shares || 0,
            token: token
                ? (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                : undefined,
            total: rightShift(totalAmount, token?.decimals).toFixed(),
        };
    }, [message, randomType, shareFromName, shares, token, totalAmount]);

    const coverImage = useMemo(
        () =>
            urlcat(SITE_URL, '/api/rp', {
                'theme-id': theme?.tid ?? DEFAULT_THEME_ID,
                usage: 'payload',
                from: shareFromName,
                amount: toFixed(rightShift(totalAmount, token?.decimals).toString()),
                type: 'fungible',
                symbol: token?.symbol,
                decimals: token?.decimals,
                message,
            }),
        [shareFromName, totalAmount, token?.decimals, token?.symbol, theme?.tid, message],
    );

    const { chainId, account } = useChainContext({ chainId: token.chainId });
    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(chainId);
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId);

    return useAsyncFn(async () => {
        if (!redPacketSettings || !redpacketContractAddress) return;
        const { duration, isRandom, message, name: senderName, shares, total, token } = redPacketSettings;
        if (!token) return;
        const seed = Math.random().toString();
        const tokenType = token!.schema === SchemaType.Native ? 0 : 1;
        const tokenAddress = token!.schema === SchemaType.Native ? NATIVE_TOKEN_ADDRESS : token!.address;
        if (!tokenAddress) {
            return;
        }

        const paramsObj: ParamsObjType = {
            publicKey,
            shares,
            isRandom,
            duration,
            seed: keccak256(seed as Hex),
            message,
            name: senderName,
            tokenType,
            tokenAddress,
            total,
            token,
        };

        try {
            checkParams(paramsObj);
        } catch {
            return;
        }

        try {
            const params = Object.values(omit(paramsObj, ['token'])) as MethodParameters;

            const value = toFixed(paramsObj.token?.schema === SchemaType.Native ? total : 0);

            const result = await writeContract(config, {
                address: redpacketContractAddress as Address,
                abi: HappyRedPacketV4ABI,
                functionName: 'create_red_packet',
                args: params,
                value: BigInt(value),
                account: account as Address,
                chainId,
            });
            if (!result) return;

            await waitForEthereumTransaction(chainId, result);
            const receipt = await getTransactionReceipt(config, {
                hash: result,
                chainId,
            });

            if (!receipt) return;

            const events = parseEventLogs({
                abi: HappyRedPacketV4ABI,
                eventName: 'CreationSuccess',
                logs: receipt.logs,
            });
            const item = first(events);
            if (!item) return;
            const { args } = decodeEventLog({
                abi: HappyRedPacketV4ABI,
                eventName: 'CreationSuccess',
                data: item.data,
                topics: item.topics,
            });
            if (!args) return;

            const {
                total: _total,
                id,
                name: _name,
                message: _message,
                duration: _duration,
                creation_time,
                ifrandom: _isRandom,
            } = args as unknown as {
                creation_time: string;
                creator: string;
                id: string;
                token_address: string;
                total: bigint;
                name: string;
                message: string;
                duration: number;
                ifrandom: boolean;
            };

            if (!id) return;

            const payload = {
                sender: {
                    address: account,
                    name: _name as string,
                    message: _message as string,
                },
                is_random: _isRandom,
                shares,
                password: '',
                rpid: id as string,
                total: _total.toString(),
                duration: Number(_duration) as number,
                creation_time: Number.parseInt(creation_time, 10) * 1000,
                token,
                network: EVMChainResolver.chainName(chainId),
                contract_address: redpacketContractAddress,
                contract_version: RED_PACKET_CONTRACT_VERSION,
                txid: receipt.transactionHash,
            };

            const typedMessage = getTypedMessageRedPacket({
                [RedPacketMetaKey]: reduceUselessPayloadInfo(payload),
            });

            const { updateTypedMessage, updateRpPayload } = useComposeStateStore.getState();

            updateTypedMessage(typedMessage);

            const metadata = getRpMetadata(typedMessage);
            if (metadata) captureLuckyDropEvent(metadata);

            if (coverImage) {
                updateRpPayload({
                    payloadImage: coverImage,
                    claimRequirements: claimRequirements ?? EMPTY_LIST,
                    publicKey,
                });
            }

            enqueueSuccessMessage(t`Lucky drop created successfully`);
            RedPacketModalRef.close();
        } catch (error) {
            if (error instanceof Error) {
                enqueueMessageFromError(error, t`Failed to create red packet`);
            }
        }
    }, [
        redPacketSettings,
        redpacketContractAddress,
        NATIVE_TOKEN_ADDRESS,
        publicKey,
        account,
        chainId,
        coverImage,
        claimRequirements,
    ]);
}
