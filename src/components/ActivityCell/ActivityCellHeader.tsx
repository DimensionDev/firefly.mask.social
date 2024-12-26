import type { HTMLProps, ReactNode } from 'react';
import type { Address } from 'viem';

import { Time } from '@/components/Semantic/Time.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { stopPropagation } from '@/helpers/stopEvent.js';

export interface ActivityCellHeaderProps extends HTMLProps<HTMLDivElement> {
    address: Address;
    displayName?: ReactNode;
    time?: number | string | Date | null;
    icon?: ReactNode;
}

export function ActivityCellHeader({
    address,
    displayName,
    time,
    icon,
    className,
    children,
    ...rest
}: ActivityCellHeaderProps) {
    const authorUrl = resolveProfileUrl(Source.Wallet, address);

    return (
        <header className={classNames('flex items-start gap-3', className)} {...rest}>
            <div className="flex flex-1 flex-grow flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap text-[15px] leading-6">
                <Link
                    href={authorUrl}
                    onClick={stopPropagation}
                    className="block max-w-full truncate font-bold text-main"
                >
                    {displayName ? displayName : formatEthereumAddress(address, 4)}
                </Link>
                {displayName ? (
                    <Link href={authorUrl} className="ml-2 block max-w-full shrink-0 truncate text-secondary">
                        <address className="not-italic">{formatEthereumAddress(address, 4)}</address>
                    </Link>
                ) : null}
                {time ? (
                    <Time dateTime={time} className="mx-1 whitespace-nowrap text-secondary">
                        · <TimestampFormatter time={time} />
                    </Time>
                ) : null}
                {icon ? <span className="mx-1"> · </span> : null}
                {icon}
            </div>

            <div className="ml-auto flex items-center space-x-2">{children}</div>
        </header>
    );
}
