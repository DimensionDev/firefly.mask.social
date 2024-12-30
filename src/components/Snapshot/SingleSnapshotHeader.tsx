'use client';
import { memo } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import SnapshotIcon from '@/assets/snapshot.svg';
import { SnapshotMoreAction } from '@/components/Actions/SnapshotMore.js';
import { ActivityCellHeader } from '@/components/ActivityCell/ActivityCellHeader.js';
import { Avatar } from '@/components/Avatar.js';
import { SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';

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
        <header className={classNames('flex w-full items-start gap-3', className)}>
            <Link href={authorUrl} className="z-[1]" onClick={(event) => event.stopPropagation()}>
                <Avatar
                    className="h-10 w-10"
                    src={data.author.avatar}
                    size={40}
                    alt={data.author.handle || data.author.id}
                />
            </Link>
            <ActivityCellHeader
                className="w-full"
                displayName={data.author.handle || ens}
                address={data.author.id}
                time={data.timestamp}
                icon={<SnapshotIcon width={15} height={15} />}
            >
                <SnapshotMoreAction data={data} />
            </ActivityCellHeader>
        </header>
    );
});
