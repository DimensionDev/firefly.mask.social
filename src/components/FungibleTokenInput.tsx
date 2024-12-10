import { t, Trans } from '@lingui/macro';
import { type FungibleToken } from '@masknet/web3-shared-base';
import { type ChainId, isNativeTokenAddress, SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm';
import { BigNumber } from 'bignumber.js';
import { type ChangeEvent, memo, useCallback, useMemo } from 'react';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import ArrowDown from '@/assets/arrow-down.svg';
import { TokenIcon } from '@/components/Tips/TokenIcon.js';
import { NUMERIC_INPUT_REGEXP_PATTERN } from '@/constants/regexp.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { formatFungibleTokenToDebankToken } from '@/helpers/formatToken.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { isZero, leftShift } from '@/helpers/number.js';
import { TokenSelectorModalRef } from '@/modals/controls.js';

const MIN_AMOUNT_LENGTH = 1;
const MAX_AMOUNT_LENGTH = 79;

export interface FungibleTokenInputProps {
    token?: FungibleToken<ChainId, SchemaType>;

    onTokenChange: (token: FungibleToken<ChainId, SchemaType>) => void;
    amount: string;
    maxAmount?: string;
    maxAmountShares?: number;
    onAmountChange: (amount: string) => void;
    balance: string;
}

export const FungibleTokenInput = memo<FungibleTokenInputProps>(function FungibleTokenInput({
    token,
    onTokenChange,
    onAmountChange,
    maxAmountShares = 1,
    maxAmount,
    balance,
    amount,
}) {
    const account = useAccount();

    const handleTokenChange = useCallback(async () => {
        if (!account.address) return;
        const picked = await TokenSelectorModalRef.openAndWaitForClose({
            address: account.address,
            isSelected: (item) => {
                const address = isAddress(item.id) ? item.id : ZERO_ADDRESS;
                return isSameEthereumAddress(address, token?.address) && item.chainId === token?.chainId;
            },
        });
        if (!picked) return;
        onTokenChange(picked);
    }, [account.address, token, onTokenChange]);

    const isNativeToken = isNativeTokenAddress(token?.address);

    const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
        () => ({
            RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${token?.decimals}}$`),
            RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals}}$`), // d.ddd...d
        }),
        [token?.decimals],
    );
    const onChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const amount_ = ev.currentTarget.value.replaceAll(',', '.');
            if (RE_MATCH_FRACTION_AMOUNT.test(amount_)) onAmountChange(`0${amount_}`);
            else if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) onAmountChange(amount_);
        },
        [onAmountChange, RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT],
    );

    const onMaxClick = useCallback(() => {
        if (!token) return;
        const amount = new BigNumber(maxAmount ?? balance).dividedBy(maxAmountShares).decimalPlaces(0, 1);
        const formattedBalance = formatBalance(amount, token.decimals, {
            significant: token.decimals,
            isPrecise: true,
            hasSeparators: false,
        });

        onAmountChange(
            (isZero(formattedBalance)
                ? new BigNumber(leftShift(amount, token.decimals).toPrecision(2)).toFormat()
                : formattedBalance) ?? '0',
        );
    }, [token, maxAmount, balance, maxAmountShares, onAmountChange]);

    return (
        <div className="rounded-xl border border-transparent bg-bg px-3 py-[10px] focus-within:border-lightHighlight focus-within:bg-primaryBottom">
            <div className="flex items-center justify-end gap-x-1 text-[13px] leading-[18px]">
                <label className="text-secondary">{isNativeToken ? t`Available Balance` : t`Balance`}</label>
                <span className="font-bold text-main">{formatBalance(balance, token?.decimals) ?? '0'}</span>
                <div
                    className="cursor-pointer rounded-full bg-lightHighlight px-[6px] py-[2px] text-[10px] font-bold leading-[14px] text-white"
                    onClick={onMaxClick}
                >
                    <Trans>MAX</Trans>
                </div>
            </div>

            <div className="mt-2 flex items-center">
                <input
                    value={amount}
                    onChange={onChange}
                    className="flex-1 border-0 border-transparent bg-transparent px-0 placeholder-secondary outline-transparent focus:border-0 focus:outline-0 focus:ring-0"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    placeholder={t`Total amount shared among all winners`}
                    inputMode="decimal"
                    min={0}
                    minLength={MIN_AMOUNT_LENGTH}
                    maxLength={MAX_AMOUNT_LENGTH}
                    pattern={NUMERIC_INPUT_REGEXP_PATTERN}
                />

                {token ? (
                    <div className="flex cursor-pointer items-center gap-x-3" onClick={handleTokenChange}>
                        <TokenIcon token={formatFungibleTokenToDebankToken(token)} />
                        <span className="text-sm font-bold leading-[18px]">{token.symbol}</span>
                        <ArrowDown width={24} height={24} />
                    </div>
                ) : null}
            </div>
        </div>
    );
});
