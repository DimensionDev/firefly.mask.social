import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo, useCallback } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import { Avatar } from '@/components/Avatar.js';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey, Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { createIndicator } from '@/helpers/pageable.js';
import { Snapshot } from '@/providers/snapshot/index.js';
import type { SnapshotVote } from '@/providers/snapshot/type.js';

import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { sanitizeDStorageUrl } from '@/helpers/sanitizeDStorageUrl.js';
import { Tooltip } from '@/components/Tooltip.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';

interface SnapshotVotesListItemProps {
    vote: SnapshotVote;
}

const SnapshotVotesListItem = memo<SnapshotVotesListItemProps>(function SnapshotVotesListItem({ vote }) {
    const authorUrl = urlcat('/profile/:address', {
        address: vote.voter,
        source: SourceInURL.Wallet,
    });
    const { data: ens } = useEnsName({ address: vote.voter as `0x${string}` });

    const choice = vote.proposal.choices[vote.choice - 1];
    return (
        <div className="mb-2 flex items-center gap-[14px] text-sm leading-[14px]">
            <Link
                href={authorUrl}
                className="z-[1] flex w-1/4 items-center gap-1 overflow-hidden overflow-ellipsis whitespace-nowrap"
            >
                <Avatar
                    className="h-[14px] w-[14px]"
                    size={14}
                    src={
                        vote.voterDetail?.avatar
                            ? sanitizeDStorageUrl(vote.voterDetail.avatar)
                            : getStampAvatarByProfileId(Source.Wallet, vote.voter)
                    }
                    alt={ens || vote.voter}
                />
                <Tooltip placement="top" content={ens || formatEthereumAddress(vote.voter, 4)}>
                    <div>{ens || formatEthereumAddress(vote.voter, 4)}</div>
                </Tooltip>
            </Link>
            <Tooltip placement="top-start" content={choice}>
                <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">{choice}</div>
            </Tooltip>

            <div className="flex gap-1">
                <span>{vote.vp > 1 ? nFormatter(vote.vp) : humanize(vote.vp)}</span>
                <span>{vote.proposal.symbol}</span>
            </div>
        </div>
    );
});

interface SnapshotVotesListProps {
    id: string;
}

function getSnapshotVotesItemContent(vote: SnapshotVote) {
    return <SnapshotVotesListItem key={vote.ipfs} vote={vote} />;
}

export const SnapshotVotesList = memo<SnapshotVotesListProps>(function SnapshotVotesList({ id }) {
    const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } = useSuspenseInfiniteQuery({
        queryKey: ['snapshot', 'votes', id],
        queryFn: async ({ pageParam }) => {
            return Snapshot.getVotesById(id, createIndicator(undefined, pageParam));
        },
        initialPageParam: '0',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        refetchOnMount: true,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }
        await fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

    if (!data?.length) {
        return <NoResultsFallback className="h-[138px] justify-center" />;
    }

    return (
        <div className="h-[138px]">
            <VirtualList
                data={data}
                endReached={onEndReached}
                components={{
                    Footer: VirtualListFooter,
                }}
                className={classNames('no-scrollbar h-full')}
                listKey={`$${ScrollListKey.SnapshotVotes}`}
                computeItemKey={(index, item) => item.ipfs}
                itemContent={(index, vote) => getSnapshotVotesItemContent(vote)}
            />
        </div>
    );
});
