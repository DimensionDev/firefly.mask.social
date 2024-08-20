import { t, Trans } from '@lingui/macro';
import { memo, useMemo } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { SendWithEVM, SendWithSolana } from '@/components/Tips/SendTipsButton.js';
import { TipsModalHeader } from '@/components/Tips/TipsModalHeader.js';
import { TokenSelectorEntry } from '@/components/Tips/TokenSelector.js';
import { WalletSelectorEntry } from '@/components/Tips/WalletSelector.js';
import { NetworkType } from '@/constants/enum.js';
import { NUMERIC_INPUT_REGEXP_PATTERN } from '@/constants/regexp.js';
import { resolveNetworkProvider, resolveTransferProvider } from '@/helpers/resolveTokenTransfer.js';
import { TipsContext } from '@/hooks/useTipsContext.js';

export const TipsUI = memo(function TipsUI() {
    const { token, recipient, amount, handle, isSending, pureWallet, update } = TipsContext.useContainer();

    const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
        () => ({
            RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${token?.decimals ?? 18}}$`),
            RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals ?? 18}}$`),
        }),
        [token?.decimals],
    );

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (value && !new RegExp(NUMERIC_INPUT_REGEXP_PATTERN).test(value)) return;
        const amount_ = value.replaceAll(/[,。]/g, '.');
        if (RE_MATCH_FRACTION_AMOUNT.test(amount_)) {
            update((prev) => ({ ...prev, amount: `0${amount_}` }));
        } else if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) {
            update((prev) => ({ ...prev, amount: amount_ }));
        }
    };

    const [{ loading }, handleUseMaxBalance] = useAsyncFn(async () => {
        if (!recipient || !token) return;
        const network = resolveNetworkProvider(recipient.networkType);
        const account = await network.getAccount();
        if (!account) return;
        const transfer = resolveTransferProvider(recipient.networkType);
        const balance = await transfer.getAvailableBalance({
            to: recipient.address,
            token,
            amount,
        });
        update((prev) => ({ ...prev, amount: balance }));
    }, []);

    const tipTitle = recipient
        ? pureWallet
            ? t`Send tips to ${handle || recipient.displayName}`
            : t`Send tips to @${handle || recipient.displayName}`
        : '';

    return (
        <>
            <TipsModalHeader title={tipTitle} />
            <div className="font-bold">
                <WalletSelectorEntry disabled={isSending} />
                <div className="mt-3 flex gap-x-3">
                    <div className="flex h-10 flex-1 items-center rounded-2xl bg-lightBg pr-3">
                        <input
                            className="h-full w-full border-none bg-transparent text-center outline-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={t`Enter amount`}
                            value={amount}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            onChange={handleAmountChange}
                            disabled={isSending}
                            inputMode="decimal"
                            pattern={NUMERIC_INPUT_REGEXP_PATTERN}
                        />
                        {token && recipient ? (
                            <ClickableButton
                                className="whitespace-nowrap font-bold text-link"
                                disabled={isSending || loading}
                                onClick={handleUseMaxBalance}
                            >
                                {loading ? (
                                    <LoadingIcon className="animate-spin" width={24} height={24} />
                                ) : (
                                    <Trans>Max</Trans>
                                )}
                            </ClickableButton>
                        ) : null}
                    </div>
                    <TokenSelectorEntry disabled={isSending} />
                </div>
                {recipient ? (
                    recipient.networkType === NetworkType.Ethereum ? (
                        <SendWithEVM />
                    ) : (
                        <SendWithSolana />
                    )
                ) : null}
            </div>
        </>
    );
});
