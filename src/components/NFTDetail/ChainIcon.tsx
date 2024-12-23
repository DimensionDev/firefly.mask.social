'use client';

import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';
import type { HTMLProps } from 'react';

import { Image } from '@/components/Image.js';
import { NetworkPluginID } from '@/constants/enum.js';
import { getNetworkDescriptor } from '@/helpers/getNetworkDescriptor.js';

interface ChainIconProps extends HTMLProps<HTMLImageElement> {
    chainId: number;
    size?: number;
}

export function ChainIcon(props: ChainIconProps) {
    const { chainId, size = 22, className } = props;

    const networkDescriptor = isValidSolanaChainId(chainId)
        ? getNetworkDescriptor(NetworkPluginID.PLUGIN_SOLANA, chainId)
        : getNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId);

    return (
        <Image
            src={networkDescriptor?.icon ?? ''}
            width={size}
            height={size}
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}
            alt={`Blockchain: ${props.chainId}`}
            className={className}
        />
    );
}
