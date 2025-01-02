import { Trans } from '@lingui/macro';
import { BigNumber } from 'bignumber.js';
import { type ChangeEvent, memo, useCallback, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';

import AddIcon from '@/assets/add-number.svg';
import LoadingIcon from '@/assets/loading.svg';
import MinusIcon from '@/assets/minus-number.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { isGreaterThan, multipliedBy, plus } from '@/helpers/number.js';
import { useSponsorMintNFT } from '@/hooks/useSponsorMintNFT.js';
import type { MintMetadata, SponsorMintOptions } from '@/providers/types/Firefly.js';

interface MintButtonProps {
    mintTarget: SponsorMintOptions;
    mintParams: MintMetadata;
    count: number | '';
    gasFee: BigNumber.Value;
    isLoading?: boolean;
    onCountChange: (count: number | '') => void;
    onSuccess?: () => void;
}

export const MintButton = memo<MintButtonProps>(function MintButton({
    mintTarget,
    mintParams,
    count,
    gasFee,
    isLoading = false,
    onCountChange,
    onSuccess,
}) {
    const mintCount = count || 1;
    const minusDisabled = mintCount <= 1;
    const maxCount = mintParams.perLimitCount || 0;
    const addDisabled = mintCount >= maxCount;
    const inputDisabled = addDisabled && minusDisabled;

    const account = useAccount();
    const balanceRes = useBalance({
        chainId: mintParams.chainId,
        address: account.address,
        query: { enabled: !!account.address && !mintParams.gasStatus },
    });

    const hasBalance = useMemo(() => {
        const mintPrice = multipliedBy(mintParams.mintPrice || '0', mintCount);
        const totalCost = plus(mintPrice, mintParams.platformFee || '0').plus(gasFee);
        return isGreaterThan(balanceRes.data?.value.toString() || '0', totalCost);
    }, [mintParams.mintPrice, mintParams.platformFee, mintCount, gasFee, balanceRes.data?.value]);

    const changeMintCount = useCallback(
        (value: string) => {
            const countStr = value.replaceAll(/[,.]/g, '');
            if (countStr === '') {
                onCountChange('');
                return;
            }
            if (/^[1-9]+\d*$/.test(countStr)) {
                const count = Number.parseInt(countStr, 10);
                if (count >= 1 && count <= maxCount) {
                    onCountChange(count);
                } else if (count > maxCount) {
                    onCountChange(maxCount);
                }
            }
        },
        [onCountChange, maxCount],
    );

    const onInputBlur = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.value === '') {
                onCountChange(1);
            }
        },
        [onCountChange],
    );

    const [{ loading }, onMint] = useSponsorMintNFT(mintTarget, mintCount, onSuccess);

    const showLoading = loading || isLoading || balanceRes.isLoading || balanceRes.isRefetching;
    const mintDisabled = maxCount <= 0 || showLoading || (!mintParams.gasStatus && !hasBalance);

    return (
        <div className="mt-6 flex items-center gap-4">
            {maxCount > 1 ? (
                <div className="flex gap-2">
                    <ClickableButton
                        disabled={minusDisabled}
                        onClick={() => changeMintCount(`${mintCount - 1}`)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-main text-lightBottom dark:text-darkBottom"
                    >
                        <MinusIcon width={20} height={20} />
                    </ClickableButton>
                    <input
                        readOnly={inputDisabled}
                        className="h-8 w-[62px] rounded-full border border-lightSecond text-center text-main focus:border-highlight"
                        value={count}
                        onChange={(e) => changeMintCount(e.target.value)}
                        onBlur={onInputBlur}
                    />
                    <ClickableButton
                        disabled={addDisabled}
                        onClick={() => changeMintCount(`${mintCount + 1}`)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-main text-lightBottom dark:text-darkBottom"
                    >
                        <AddIcon width={20} height={20} />
                    </ClickableButton>
                </div>
            ) : null}
            <ClickableButton
                disabled={mintDisabled}
                onClick={onMint}
                className="h-8 flex-1 rounded-full bg-main text-center text-sm font-bold !leading-8 text-lightBottom dark:text-darkBottom"
            >
                {showLoading ? (
                    <LoadingIcon className="inline-block animate-spin" width={24} height={24} />
                ) : !mintParams.gasStatus && !hasBalance ? (
                    <Trans>Insufficient Balance</Trans>
                ) : (
                    <Trans>Mint</Trans>
                )}
            </ClickableButton>
        </div>
    );
});
