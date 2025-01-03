import { t } from '@lingui/macro';
import { useMemo } from 'react';

import LinkIcon from '@/assets/link-square.svg';
import { Link } from '@/components/Link.js';
import { Tooltip } from '@/components/Tooltip.js';
import type { NetworkType } from '@/constants/enum.js';
import { resolveNetworkProvider } from '@/helpers/resolveTokenTransfer.js';

interface AddressLinkProps {
    address: string;
    chainId?: number;
    networkType: NetworkType;
}

export function AddressLink({ address, chainId, networkType }: AddressLinkProps) {
    const addressLink = useMemo(() => {
        const network = resolveNetworkProvider(networkType);
        const targetChain = chainId ?? network.getChainId();
        if (!targetChain) return;
        return network.getAddressUrl(targetChain, address);
    }, [networkType, chainId, address]);

    if (!addressLink) return null;

    return (
        <Tooltip placement="top" content={t`View on explorer`}>
            <Link href={addressLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <LinkIcon width={16} height={16} />
            </Link>
        </Tooltip>
    );
}
