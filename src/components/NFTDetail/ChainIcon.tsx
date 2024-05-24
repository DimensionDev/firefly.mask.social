'use client';

import { NetworkPluginID } from '@masknet/shared-base';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';

import { Image } from '@/components/Image.js';

export function ChainIcon(props: { chainId: number; size?: number }) {
    const { chainId, size = 22 } = props;
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
        />
    );
}
