'use client';

import { NetworkPluginID } from '@masknet/shared-base';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';
import type { HTMLProps } from 'react';

import { Image } from '@/components/Image.js';

interface ChainIconProps extends HTMLProps<HTMLImageElement> {
    chainId: number;
    size?: number;
}

export function ChainIcon(props: ChainIconProps) {
    const { chainId, size = 22, className } = props;
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId);
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
