'use client';

import { NetworkPluginID } from '@masknet/shared-base';
import { useNetworkDescriptor } from '@masknet/web3-hooks-base';

import { Image } from '@/components/Image.js';

export function ChainIcon(props: { chainId: number }) {
    const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, props.chainId);
    return (
        <Image
            src={networkDescriptor?.icon ?? ''}
            className="h-[22px] w-[22px]"
            width={22}
            height={22}
            alt={`Blockchain: ${props.chainId}`}
        />
    );
}
