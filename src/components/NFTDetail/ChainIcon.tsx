'use client';

import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import { isValidChainId as isValidSolanaChainId } from '@masknet/web3-shared-solana';
import type { HTMLProps } from 'react';

import { Image } from '@/components/Image.js';
import { NetworkPluginID } from '@/constants/enum.js';

interface ChainIconProps extends HTMLProps<HTMLImageElement> {
    chainId: number;
    size?: number;
}

export function ChainIcon(props: ChainIconProps) {
    const { chainId, size = 22, className } = props;
    const evmNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId);
    const solanaNetworkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_SOLANA, chainId);

    const networkDescriptor = isValidSolanaChainId(chainId) ? solanaNetworkDescriptor : evmNetworkDescriptor;

    return (
        <Image
            src={networkDescriptor?.icon ?? ''}
            width={chainId}
            height={chainId}
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}
            alt={`Blockchain: ${props.chainId}`}
            className={className}
        />
    );
}
