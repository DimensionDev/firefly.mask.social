import { t } from '@lingui/macro';
import { EVMExplorerResolver } from '@masknet/web3-providers';
import { ChainId } from '@masknet/web3-shared-evm';
import { useChainId } from 'wagmi';

import LinkIcon from '@/assets/link-square.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { Link } from '@/esm/Link.js';

interface AddressLinkProps {
    address: string;
    chainId?: ChainId;
}

export function AddressLink({ address, chainId }: AddressLinkProps) {
    const connectedChainId = useChainId();
    const addressLink = EVMExplorerResolver.addressLink(chainId || connectedChainId, address);

    if (!addressLink) return null;

    return (
        <Tooltip placement="top" content={t`View on explorer`}>
            <Link href={addressLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <LinkIcon width={20} height={20} />
            </Link>
        </Tooltip>
    );
}
