import { Trans } from '@lingui/macro';
import { type HTMLProps, memo } from 'react';

import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { chains } from '@/configs/wagmiClient.js';
import { classNames } from '@/helpers/classNames.js';
import type { MintMetadata, NFTAsset } from '@/providers/types/Firefly.js';

interface MintParamsPanelProps extends HTMLProps<HTMLUListElement> {
    nft: NFTAsset;
    mintParams: MintMetadata;
}

export const MintParamsPanel = memo<MintParamsPanelProps>(function MintParamsPanel({ nft, mintParams, className }) {
    const chain = chains.find((chain) => chain.id === mintParams.chainId);
    const isFree = mintParams.gasStatus !== true;

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
                <span className="text-lightSecond">{isFree ? <Trans>FREE</Trans> : null}</span>
            </li>
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Platform fee</Trans>
                </span>
                <span className="text-lightSecond">0.000081 ETH</span>
            </li>
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Network cost</Trans>
                </span>
                <span className="text-lightSecond">0.000081 ETH</span>
            </li>
            <li className="flex w-full items-center justify-between">
                <span>
                    <Trans>Total</Trans>
                </span>
                <span className="flex items-center gap-3">
                    <span
                        className={classNames('text-lightSecond', {
                            'line-through': isFree,
                        })}
                    >
                        0.000081 ETH
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
