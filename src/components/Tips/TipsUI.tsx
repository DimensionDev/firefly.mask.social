import { t } from '@lingui/macro';
import { formatBalance, isGreaterThan, isLessThan, isSameAddress, isZero, rightShift } from '@masknet/web3-shared-base';
import { rootRouteId, useMatch } from '@tanstack/react-router';
import { memo, useMemo } from 'react';
import { useAccount, useBalance, useEstimateGas } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { TipsModalHeader } from '@/components/Tips/TipsModalHeader.js';
import { router, TipsRoutePath } from '@/components/Tips/tipsModalRouter.js';
import { TokenSelectorEntry } from '@/components/Tips/TokenSelector.js';
import { WalletSelectorEntry } from '@/components/Tips/WalletSelector.js';
import { trimify } from '@/helpers/trimify.js';
import { useAddressValidate } from '@/hooks/useAddressValidate.js';
import { useSendTip } from '@/hooks/useSendTip.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import { ConnectWalletModalRef } from '@/modals/controls.js';

export const TipsUI = memo(function TipsUI() {
    const account = useAccount();
    const [isSending, sendTip] = useSendTip();
    const { context } = useMatch({ from: rootRouteId });
    const { token, receiver, amount, handle, update } = TipsContext.useContainer();

    const {
        loading,
        validation: [isValid, message],
    } = useAddressValidate(receiver?.address ?? '');
    const { data: gasToken, isLoading: loadingGasToken } = useBalance({
        address: account.address,
        chainId: token?.chainId ?? undefined,
    });
    const { data, isLoading: loadingToken } = useBalance({
        address: account.address,
        chainId: token?.chainId ?? undefined,
        token: token?.id,
    });
    const { data: estimateGas, isLoading: gasLoading } = useEstimateGas({
        account: account.address,
        chainId: token?.chainId ?? undefined,
        to: receiver?.address,
    });

    const isLoading = isSending || loading || loadingToken || loadingGasToken || gasLoading;
    const noEnoughBalance =
        !!token && isGreaterThan(rightShift(amount, data?.decimals), `${data?.value ?? token.amount}`);
    const noEnoughGas = !!gasToken && !!estimateGas && isLessThan(`${gasToken.value}`, `${estimateGas}`);

    const buttonLabel = useMemo(() => {
        if (account.isConnecting) return t`Connecting...`;
        if (!account.isConnected) return t`Connect Wallet`;
        if (isSameAddress(account.address, receiver?.address)) return t`Cannot send to yourself`;
        if (message) return message;
        if (noEnoughBalance) return t`Insufficient balance`;
        if (noEnoughGas) return t`Insufficient Balance for Gas Fee`;

        return t`Send Tips`;
    }, [
        account.isConnected,
        account.isConnecting,
        account.address,
        receiver?.address,
        message,
        noEnoughBalance,
        noEnoughGas,
    ]);
    const buttonDisabled = useMemo(() => {
        if (account.isConnecting) return true;
        if (!account.isConnected) return false;
        if (
            isSameAddress(account.address, receiver?.address) ||
            !token ||
            !receiver ||
            !trimify(amount) ||
            isZero(trimify(amount)) ||
            !isValid ||
            noEnoughBalance ||
            noEnoughGas ||
            isLoading
        )
            return true;
        return false;
    }, [
        token,
        receiver,
        amount,
        account.isConnecting,
        account.isConnected,
        account.address,
        isValid,
        noEnoughBalance,
        noEnoughGas,
        isLoading,
    ]);

    const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
        () => ({
            RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${token?.decimals}}$`),
            RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals}}$`),
        }),
        [token?.decimals],
    );

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount_ = e.currentTarget.value.replaceAll(',', '.');
        if (RE_MATCH_FRACTION_AMOUNT.test(amount_)) {
            update((prev) => ({ ...prev, amount: `0${amount_}` }));
        } else if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) {
            update((prev) => ({ ...prev, amount: amount_ }));
        }
    };
    const handleSendTips = async () => {
        if (!account.isConnected) {
            ConnectWalletModalRef.open();
            context.close();
            return;
        }
        const hash = await sendTip();
        if (hash) {
            update((prev) => ({ ...prev, hash }));
            router.navigate({ to: TipsRoutePath.SUCCESS });
        }
    };

    return (
        <>
            <TipsModalHeader title={receiver ? t`Tip to @${handle || receiver.displayName}` : undefined} />
            <div className="font-bold">
                <WalletSelectorEntry disabled={!account.isConnected} />
                <div className="mt-3 flex gap-x-3">
                    <div className="h-10 flex-1 rounded-2xl bg-lightBg">
                        <input
                            className="h-full w-full border-none bg-transparent text-center outline-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={
                                token
                                    ? data
                                        ? t`Max: ${formatBalance(`${data.value}`, data.decimals, { isFixed: true })}`
                                        : t`Max: ${token.balance}`
                                    : t`Enter amount`
                            }
                            value={amount}
                            onChange={handleAmountChange}
                            disabled={!account.isConnected}
                        />
                    </div>
                    <TokenSelectorEntry disabled={!account.isConnected} />
                </div>
                <ClickableButton
                    className="mt-6 flex h-10 w-full items-center justify-center rounded-[20px] bg-lightMain text-lightBottom dark:text-darkBottom"
                    disabled={buttonDisabled}
                    onClick={handleSendTips}
                >
                    {isLoading ? <LoadingIcon className="animate-spin" width={24} height={24} /> : buttonLabel}
                </ClickableButton>
            </div>
        </>
    );
});
