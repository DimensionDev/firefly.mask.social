'use client';
import { memo } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import SnapshotIcon from '@/assets/snapshot.svg';
import { Avatar } from '@/components/Avatar.js';
import { SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';
import { Time } from '@/components/Semantic/Time.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';

interface SingleSnapshotHeaderProps {
    data: SnapshotActivity;
    className?: string;
}

export const SingleSnapshotHeader = memo<SingleSnapshotHeaderProps>(function SingleArticleHeader({ data, className }) {
    const authorUrl = urlcat('/profile/:address', {
        address: data.author.id,
        source: SourceInURL.Wallet,
    });

    const { data: ens } = useEnsName({ address: data.author.id, query: { enabled: !data.author.handle } });

    return (
        <header className={classNames('flex items-start gap-3', className)}>
            <Link href={authorUrl} className="z-[1]" onClick={(event) => event.stopPropagation()}>
                <Avatar
                    className="h-10 w-10"
                    src={data.author.avatar}
                    size={40}
                    alt={data.author.handle || data.author.id}
                />
            </Link>

            <div className="flex max-w-[calc(100%-40px-88px-24px)] flex-1 items-center gap-2 overflow-hidden">
                <Link
                    href={authorUrl}
                    onClick={(event) => event.stopPropagation()}
                    className="block truncate text-clip text-medium font-bold leading-5 text-main"
                >
                    {data.author.handle || ens}
                </Link>
                <Link href={authorUrl} className="truncate text-clip text-medium leading-6 text-secondary">
                    <address className="not-italic">{formatEthereumAddress(data.author.id, 4)}</address>
                </Link>
                <span className="truncate text-medium leading-6 text-secondary">
                    <Time
                        dateTime={data.timestamp}
                        className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]"
                    >
                        <TimestampFormatter time={data.timestamp} />
                    </Time>
                </span>
                <SnapshotIcon width={15} height={15} />
            </div>
            <div className="ml-auto flex items-center space-x-2">
                {/* {Icon ? <Icon width={size} height={size} /> : null} */}

                {/* {!isBookmark ? (
                    <>
                        <Time
                            dateTime={article.timestamp}
                            className="whitespace-nowrap text-xs leading-4 text-secondary md:text-[13px]"
                        >
                            <TimestampFormatter time={article.timestamp} />
                        </Time>
                        <ArticleMoreAction article={article} />
                    </>
                ) : null} */}
            </div>
        </header>
    );
});
