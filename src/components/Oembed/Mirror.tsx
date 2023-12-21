'use client';

import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { memo } from 'react';
import { useEnsAvatar, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import MirrorIon from '@/assets/mirror.xyz.svg';
import { Avatar } from '@/components/Avatar.js';
import { NakedMarkup } from '@/components/Markup/index.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Link } from '@/esm/Link.js';

interface MirrorProps {
    address?: `0x${string}`;
    title: string;
    description: string;
    url: string;
    ens?: string;
    displayName?: string;
    timestamp?: number;
}

export const Mirror = memo<MirrorProps>(function Mirror({
    address,
    url,
    ens,
    displayName,
    timestamp,
    title,
    description,
}) {
    const { data: ensName = ens } = useEnsName({
        address,
        chainId: mainnet.id,
        enabled: !!address && !ens,
    });
    const { data: avatar } = useEnsAvatar({
        name: ens ?? ensName,
        chainId: mainnet.id,
        enabled: !!ensName && !!ens,
    });

    return (
        <div className="mt-4 text-sm">
            <Link href={url} target={url.includes(location.host) ? '_self' : '_blank'} rel="noreferrer noopener">
                <div className="cursor-pointer rounded-2xl border border-solid border-third bg-primaryBottom  px-4 py-3 hover:bg-bg dark:bg-secondaryBottom">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Avatar src={avatar!} size={24} alt={ensName || address || ''} />

                            {displayName ? <span className="text-sm font-medium text-main">{displayName}</span> : null}
                            {ensName || address ? (
                                <span className="text-[13px] leading-[20px] text-secondary">
                                    {ensName || (address ? formatEthereumAddress(address, 4) : null)}
                                </span>
                            ) : null}
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-medium text-secondary">
                            <MirrorIon width={16} height={16} />
                            <span>
                                <TimestampFormatter time={timestamp} />
                            </span>
                        </div>
                    </div>

                    {title ? (
                        <h4 className="line-clamp-2 border-b border-line py-2 text-base font-semibold leading-5 text-main">
                            {title}
                        </h4>
                    ) : null}
                    {description ? (
                        <NakedMarkup className="font-sm my-2 line-clamp-3 text-secondary">{description}</NakedMarkup>
                    ) : null}
                </div>
            </Link>
        </div>
    );
});
