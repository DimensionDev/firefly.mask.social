import { ChainId } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { memo, useCallback, useMemo, useRef } from 'react';
import urlcat from 'urlcat';
import { useEnsName } from 'wagmi';

import { Avatar } from '@/components/Avatar.js';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { ScrollListKey, Source, SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { formatSnapshotChoice } from '@/helpers/formatSnapshotChoice.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { createIndicator } from '@/helpers/pageable.js';
import { sanitizeDStorageUrl } from '@/helpers/sanitizeDStorageUrl.js';
import { Snapshot } from '@/providers/snapshot/index.js';
import type { SnapshotVote } from '@/providers/snapshot/type.js';
import type { Hex } from 'viem';

interface SnapshotVotesListItemProps {
    vote: SnapshotVote;
}

const SnapshotVotesListItem = memo<SnapshotVotesListItemProps>(function SnapshotVotesListItem({ vote }) {
    const authorUrl = urlcat('/profile/:address', {
        address: vote.voter,
        source: SourceInURL.Wallet,
    });

    const { data: ens } = useEnsName({ address: vote.voter as Hex, chainId: ChainId.Mainnet });

    const choiceLabel = formatSnapshotChoice(vote.choice, vote.proposal.type, vote.proposal.choices);

    return (
        <div className="mb-2 flex items-center gap-[14px] text-sm leading-[16px]">
            <Link href={authorUrl} className="z-[1] flex items-center gap-1 truncate max-md:w-1/4 md:w-[120px]">
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
                <TextOverflowTooltip
                    className="max-sm:block"
                    placement="top"
                    content={ens || formatEthereumAddress(vote.voter, 4)}
                >
                    <div className="truncate">{ens || formatEthereumAddress(vote.voter, 4)}</div>
                </TextOverflowTooltip>
            </Link>
            <TextOverflowTooltip className="max-sm:block" placement="top-start" content={choiceLabel}>
                <div className="flex-1 truncate">{choiceLabel}</div>
            </TextOverflowTooltip>

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
    const itemsRendered = useRef(false);

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

    const Context = useMemo(
        () => ({
            hasNextPage,
            fetchNextPage,
            isFetching,
            itemsRendered: itemsRendered.current,
        }),
        [hasNextPage, fetchNextPage, isFetching],
    );

    if (!data?.length) {
        return <NoResultsFallback className="justify-center" />;
    }

    return (
        <div className="min-h-[140px] flex-1">
            <VirtualList
                data={data}
                endReached={onEndReached}
                components={{
                    Footer: VirtualListFooter,
                }}
                itemSize={(el: HTMLElement) => {
                    if (!itemsRendered.current) itemsRendered.current = true;
                    return el.getBoundingClientRect().height;
                }}
                className={classNames('no-scrollbar h-full')}
                listKey={`$${ScrollListKey.SnapshotVotes}`}
                computeItemKey={(index, item) => item.ipfs}
                itemContent={(index, vote) => getSnapshotVotesItemContent(vote)}
                context={Context}
            />
        </div>
    );
});
