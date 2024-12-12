'use client';

import { t, Trans } from '@lingui/macro';
import { type FungibleToken } from '@masknet/web3-shared-base';
import { type ChainId, SchemaType, useRedPacketConstants } from '@masknet/web3-shared-evm';
import { useRouter } from '@tanstack/react-router';
import { BigNumber } from 'bignumber.js';
import { isUndefined, omit } from 'lodash-es';
import { type ChangeEvent, useCallback, useContext, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { getChainId, switchChain, writeContract } from 'wagmi/actions';

import QuestionIcon from '@/assets/question.svg';
import RedPacketIcon from '@/assets/red-packet.svg';
import { ChainGuardButton } from '@/components/ChainGuardButton.js';
import { FungibleTokenInput } from '@/components/FungibleTokenInput.js';
import { Tab, Tabs } from '@/components/Tabs/index.js';
import { TokenValue } from '@/components/TokenValue.js';
import { Tooltip } from '@/components/Tooltip.js';
import { config } from '@/configs/wagmiClient.js';
import { createAccount } from '@/helpers/createAccount.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { getTokenAbiForWagmi } from '@/helpers/getTokenAbiForWagmi.js';
import { isGreaterThan, isZero, leftShift, multipliedBy, rightShift, ZERO } from '@/helpers/number.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { useAvailableBalance } from '@/hooks/useAvailableBalance.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useERC20TokenAllowance } from '@/hooks/useERC20Allowance.js';
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import {
    RED_PACKET_CONTRACT_VERSION,
    RED_PACKET_DURATION,
    RED_PACKET_MAX_SHARES,
    RED_PACKET_MIN_SHARES,
} from '@/mask/plugins/red-packet/constants.js';
import { useDefaultCreateGas } from '@/mask/plugins/red-packet/hooks/useDefaultCreateGas.js';
import { RedPacketContext, redPacketRandomTabs } from '@/modals/RedPacketModal/RedPacketContext.js';

export function MainView() {
    const { history } = useRouter();

    const {
        message,
        setMessage,
        randomType,
        setRandomType,
        shares,
        setShares,
        token: selectedToken,
        setToken,
        setTotalAmount,
    } = useContext(RedPacketContext);

    const [rawAmount, setRawAmount] = useState('');

    const { chainId } = useChainContext({
        chainId: selectedToken?.chainId,
    });
    const nativeToken = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId]);

    const token = selectedToken || nativeToken;

    const { data: nativeTokenPrice = 0, isLoading: priceLoading } = useNativeTokenPrice({ chainId });
    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(chainId);

    const isRandom = randomType === 'random';

    const { account: publicKey } = useMemo(createAccount, []);
    const { value: defaultGas = ZERO, loading: gasLoading } = useDefaultCreateGas(
        {
            duration: RED_PACKET_DURATION,
            isRandom: randomType === 'random',
            name: 'Unknown User',
            message: message || t`Best Wishes!`,
            shares: shares || 0,
            token: token
                ? (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                : undefined,
            total: rightShift(0.0001, token.decimals).toFixed(),
        },
        RED_PACKET_CONTRACT_VERSION,
        publicKey,
        { chainId },
    );

    const balanceResult = useAvailableBalance(token.address as `0x${string}`, defaultGas.toNumber(), { chainId });
    const { gasFee, value: balance = ZERO, origin: originBalance } = balanceResult ?? {};

    const amount = rightShift(rawAmount || '0', token?.decimals);
    const rawTotalAmount = useMemo(
        () => (isRandom || !rawAmount ? rawAmount : multipliedBy(rawAmount, shares).toFixed()),
        [rawAmount, isRandom, shares],
    );

    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : (shares ?? '0')), [amount, shares, isRandom]);
    const minTotalAmount = useMemo(() => new BigNumber(isRandom ? 1 : (shares ?? 0)), [shares, isRandom]);
    const isDivisible = !totalAmount.dividedBy(shares).isLessThan(1);

    const handleTokenChange = useCallback(
        (token: FungibleToken<ChainId, SchemaType>) => {
            setToken(token);
            setRawAmount('');
        },
        [setToken, setRawAmount],
    );

    const onShareChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const shares_ = ev.currentTarget.value.replaceAll(/[,.]/g, '');
            if (shares_ === '') setShares('');
            else if (/^[1-9]+\d*$/.test(shares_)) {
                const parsed = Number.parseInt(shares_, 10);
                if (parsed >= RED_PACKET_MIN_SHARES && parsed <= RED_PACKET_MAX_SHARES) {
                    setShares(Number.parseInt(shares_, 10));
                } else if (parsed > RED_PACKET_MAX_SHARES) {
                    setShares(RED_PACKET_MAX_SHARES);
                }
            }
        },
        [setShares],
    );

    const {
        data: allowance,
        isLoading: allowanceLoading,
        refetch: refetchAllowance,
    } = useERC20TokenAllowance(token.address as `0x${string}`, redpacketContractAddress, {
        chainId,
    });

    const cost = gasFee ? leftShift(gasFee, token.decimals).multipliedBy(nativeTokenPrice) : ZERO;

    // #region validation
    const noShares = isZero(shares || '0');
    const isGteMaxShares = isGreaterThan(shares || '0', 255);
    const isInSufficientBalance =
        isGreaterThan(minTotalAmount, balance.toString()) || isGreaterThan(totalAmount, balance.toString());
    const noAmount = isZero(amount);
    const isInSufficientBalanceForGas =
        gasFee && !isZero(gasFee) && originBalance && isGreaterThan(gasFee.toString(), originBalance.value.toString());
    const isNotEnoughAllowance = !isUndefined(allowance) && !isGreaterThan(allowance.toString(), totalAmount);

    const disabled =
        noShares || isGteMaxShares || isInSufficientBalance || noAmount || !isDivisible || isInSufficientBalanceForGas;

    const loading = priceLoading || gasLoading || allowanceLoading;
    // #endregion

    // #region button
    const buttonText = useMemo(() => {
        if (noShares) return <Trans>Enter Number of Winners</Trans>;
        if (isGteMaxShares) return <Trans>At most 255 recipients</Trans>;
        if (isInSufficientBalance) return <Trans>Insufficient Balance</Trans>;
        if (noAmount) {
            return isRandom ? <Trans>Enter Total Amount</Trans> : <Trans>Enter Amount Each</Trans>;
        }

        if (!isDivisible)
            return (
                <Trans>
                    The minimum amount for each share is {formatBalance(1, token.decimals)} {token.symbol}
                </Trans>
            );

        if (isNotEnoughAllowance) {
            return (
                <span className="flex items-center gap-x-2">
                    <Trans>Unlock {token.symbol}</Trans>
                    <Tooltip
                        content={
                            <Trans>
                                Grant access to your {token.symbol} for the Lucky Drop Smart contract. You only have to
                                do this once per token.
                            </Trans>
                        }
                        placement="top"
                    >
                        <QuestionIcon width={18} height={18} />
                    </Tooltip>
                </span>
            );
        }

        if (isInSufficientBalanceForGas) {
            return <Trans>Insufficient Balance for Gas Fee</Trans>;
        }

        return <Trans>Next</Trans>;
    }, [
        noShares,
        isGteMaxShares,
        isInSufficientBalance,
        noAmount,
        isDivisible,
        token.decimals,
        token.symbol,
        isInSufficientBalanceForGas,
        isNotEnoughAllowance,
        isRandom,
    ]);

    const [{ loading: interactionLoading }, handleClick] = useAsyncFn(async () => {
        const globalChainId = getChainId(config);
        if (!originBalance || isZero(originBalance.value.toString())) return;

        if (globalChainId !== chainId) {
            await switchChain(config, { chainId });
        }

        if (isNotEnoughAllowance) {
            const result = await writeContract(config, {
                chainId,
                abi: getTokenAbiForWagmi(chainId, token.address as `0x${string}`),
                address: token.address as `0x${string}`,
                functionName: 'approve',
                args: [redpacketContractAddress as `0x${string}`, originBalance.value],
            });
            await waitForEthereumTransaction(chainId, result);
            refetchAllowance();
            return;
        }

        setToken(token);
        setTotalAmount(rawTotalAmount);

        history.push('/requirements');
    }, [chainId, isNotEnoughAllowance, redpacketContractAddress, token, originBalance, rawTotalAmount]);
    // #endregion

    return (
        <>
            <div className="flex flex-1 flex-col gap-y-4 bg-primaryBottom px-4 pt-2">
                <Tabs value={randomType} onChange={setRandomType} variant="solid" className="self-start">
                    {redPacketRandomTabs.map((tab) => (
                        <Tab value={tab.value} key={tab.value}>
                            {tab.label}
                        </Tab>
                    ))}
                </Tabs>

                <div className="flex items-center rounded-xl border border-transparent bg-bg pr-3 focus-within:border-lightHighlight focus-within:bg-bottom">
                    <form className="w-full flex-1">
                        <label className="flex w-full flex-1 items-center">
                            <input
                                value={shares}
                                onChange={onShareChange}
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                                placeholder={t`Enter number of winners`}
                                className={
                                    'w-full border-0 bg-transparent py-2 placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0'
                                }
                                inputMode="decimal"
                                pattern="^[0-9]+$"
                            />
                        </label>
                    </form>
                    <span className="mr-1 text-[14px] leading-[18px] text-secondary">
                        <Trans>Winners</Trans>
                    </span>
                    <RedPacketIcon width={18} height={18} />
                </div>

                <FungibleTokenInput
                    amount={rawAmount}
                    maxAmount={
                        minTotalAmount.isGreaterThan(balance.toString()) && !isZero(balance.toString())
                            ? minTotalAmount.toString()
                            : undefined
                    }
                    token={token}
                    onTokenChange={handleTokenChange}
                    onAmountChange={setRawAmount}
                    balance={balance.toString()}
                    maxAmountShares={isRandom || shares === '' ? 1 : shares}
                />

                <label className="self-start text-[14px] font-bold leading-[18px]">
                    <Trans>Message</Trans>
                </label>

                <div className="flex items-center rounded-xl border border-transparent bg-bg pr-3 focus-within:border-lightHighlight focus-within:bg-bottom">
                    <form className="w-full flex-1">
                        <label className="flex w-full flex-1 items-center">
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t`Best Wishes!`}
                                className={
                                    'w-full border-0 bg-transparent py-2 placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0'
                                }
                            />
                        </label>
                    </form>
                </div>

                {gasFee && !isZero(gasFee) ? (
                    <div className="flex justify-between">
                        <label className="text-[14px] font-bold leading-[18px]">
                            <Trans>Network cost</Trans>
                        </label>
                        <div className="flex gap-x-1 text-[14px] font-bold leading-[18px] text-secondary">
                            <span>
                                {formatBalance(gasFee, token.decimals)} {token.symbol}
                            </span>
                            <span>≈</span>
                            <span>${cost.toFixed(2)}</span>
                        </div>
                    </div>
                ) : null}

                {rawTotalAmount && !isZero(rawTotalAmount) ? (
                    <TokenValue token={token} amount={rawTotalAmount} chainId={chainId} />
                ) : null}
            </div>
            <div className="flex-grow" />
            <div className="w-full bg-lightBottom80 p-4 shadow-primary backdrop-blur-lg dark:shadow-primaryDark">
                <ChainGuardButton
                    targetChainId={chainId}
                    className="rounded-lg"
                    disabled={disabled}
                    loading={loading || interactionLoading}
                    onClick={handleClick}
                >
                    {buttonText}
                </ChainGuardButton>
            </div>
        </>
    );
}
