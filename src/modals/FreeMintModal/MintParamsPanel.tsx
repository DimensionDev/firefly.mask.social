import { Trans } from '@lingui/macro';
import { BigNumber } from 'bignumber.js';
import { type HTMLProps, memo } from 'react';
import { useEstimateFeesPerGas } from 'wagmi';

import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { chains } from '@/configs/wagmiClient.js';
import { classNames } from '@/helpers/classNames.js';
import { formatPrice, renderShrankPrice } from '@/helpers/formatPrice.js';
import { leftShift, multipliedBy, plus, ZERO } from '@/helpers/number.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import type { MintMetadata, NFTAsset } from '@/providers/types/Firefly.js';

interface MintParamsPanelProps extends HTMLProps<HTMLUListElement> {
    nft: NFTAsset;
    mintParams: MintMetadata;
}

function renderPrice(price: BigNumber.Value, decimals = 18, symbol?: string) {
    return (
        <>
            {renderShrankPrice(formatPrice(leftShift(price, decimals).toString()) || '-')}
            {` ${symbol}`}
        </>
    );
}

export const MintParamsPanel = memo<MintParamsPanelProps>(function MintParamsPanel({ nft, mintParams, className }) {
    const chain = chains.find((chain) => chain.id === mintParams.chainId);
    const { decimals, symbol } = chain?.nativeCurrency || {};
    const isFree = mintParams.gasStatus === true;

    const isEIP1559 = EVMChainResolver.isFeatureSupported(mintParams.chainId, 'EIP1559');
    const { data, isLoading } = useEstimateFeesPerGas({
        chainId: mintParams.chainId,
        type: isEIP1559 ? 'eip1559' : 'legacy',
    });

    const gasLimit = mintParams.txData.gasLimit || '0';
    const gasFee = isEIP1559
        ? !data?.maxFeePerGas
            ? ZERO
            : multipliedBy(data.maxFeePerGas.toString(), gasLimit)
        : !data?.gasPrice
          ? ZERO
          : multipliedBy(data.gasPrice.toString(), gasLimit);

    const totalCost = plus(mintParams.mintPrice || '0', mintParams.platformFee || '0').plus(gasFee);

    return (
        <ul className={classNames('flex w-full flex-col gap-3 text-base text-main', className)}>
            {chain ? (
                <li className="flex w-full items-center justify-between">
                    <span>
                        <Trans>Chain</Trans>
                    </span>
                    <span className="flex items-center gap-2">
                        <ChainIcon size={16} chainId={mintParams.chainId} />
                        <span className="text-sm">{chain.name}</span>
                    </span>
                </li>
            ) : null}
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Mint price</Trans>
                </span>
                <span className="text-lightSecond">
                    {isFree ? <Trans>FREE</Trans> : renderPrice(mintParams.mintPrice || '0', decimals, symbol)}
                </span>
            </li>
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Platform fee</Trans>
                </span>
                <span className="text-lightSecond">{renderPrice(mintParams.platformFee || '0', decimals, symbol)}</span>
            </li>
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Network cost</Trans>
                </span>
                <span
                    className={classNames(
                        'text-lightSecond',
                        isLoading ? 'h-6 w-24 animate-pulse bg-primaryBottom' : '',
                    )}
                >
                    {isLoading ? '' : renderPrice(gasFee, decimals, symbol)}
                </span>
            </li>
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Total</Trans>
                </span>
                <span className="flex items-center gap-3">
                    <span
                        className={classNames('text-lightSecond', {
                            'line-through': isFree,
                            'h-6 w-24 animate-pulse bg-primaryBottom': isLoading,
                        })}
                    >
                        {isLoading ? '' : renderPrice(totalCost, decimals, symbol)}
                    </span>
                    {isFree ? (
                        <span className="rounded bg-[#E8E8FF] px-2 py-1 text-sm text-highlight">
                            <Trans>Free</Trans>
                        </span>
                    ) : null}
                </span>
            </li>
        </ul>
    );
});
