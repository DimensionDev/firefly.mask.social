'use client';

import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { uniq } from 'lodash-es';
import type { Address } from 'viem';
import { useEnsName } from 'wagmi';

import LinkIcon from '@/assets/link-square.svg';
import { Image } from '@/components/Image.js';
import { Link } from '@/components/Link.js';
import { ListInPage } from '@/components/ListInPage.js';
import { WatchButton } from '@/components/Profile/WatchButton.js';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { Tooltip } from '@/components/Tooltip.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { SimpleHashProvider } from '@/providers/simplehash/index.js';

interface AttendeesProps {
    eventId: number;
}

export function Attendees({ eventId }: AttendeesProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['poap-event-owners', eventId],
        async queryFn({ pageParam }) {
            const indicator = createIndicator(undefined, pageParam);
            const result = await SimpleHashProvider.getPoapEvent(eventId, { indicator });
            const owners = uniq(result.data.flatMap((asset) => asset.owners.map((owner) => owner.owner_address)));
            return {
                ...result,
                data: owners,
            };
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page?.data ?? EMPTY_LIST),
    });

    return (
        <div className="space-y-5">
            <h3 className="text-xl font-bold leading-6">
                <Trans>Attendees</Trans>
            </h3>
            <ListInPage
                source={Source.Wallet}
                queryResult={queryResult}
                VirtualListProps={{
                    listKey: `${ScrollListKey.TopCollectors}:${eventId}`,
                    computeItemKey: (index, owner) => `${index}-${owner}`,
                    itemContent: (index, owner) => getAttendeesItemContent(index, owner as Address),
                }}
            />
        </div>
    );
}

function AttendeesItem({ ownerAddress }: { ownerAddress: Address }) {
    const { data: ensName } = useEnsName({ address: ownerAddress, chainId: ChainId.Mainnet });
    const addressOrEns = ensName ? ensName : ownerAddress;

    return (
        <div className="flex items-center justify-between pb-3">
            <Link
                href={resolveProfileUrl(Source.Wallet, ownerAddress)}
                className="flex max-w-[calc(100%-110px)] items-center"
            >
                <Image
                    src={getStampAvatarByProfileId(Source.Wallet, addressOrEns)}
                    alt={ownerAddress}
                    width={30}
                    height={30}
                    className="mr-2 min-w-[30px] shrink-0 rounded-full"
                />
                <div className="flex max-w-[calc(100%-38px)] items-center gap-1.5 text-left">
                    {ensName ? (
                        <TextOverflowTooltip content={addressOrEns} placement="top">
                            <div className="w-full truncate">{ensName}</div>
                        </TextOverflowTooltip>
                    ) : (
                        <Tooltip content={addressOrEns} placement="top">
                            <span>{formatEthereumAddress(ownerAddress, 4)}</span>
                        </Tooltip>
                    )}
                    <LinkIcon width={14} height={14} className="shrink-0 text-secondary" />
                </div>
            </Link>
            <WatchButton address={ownerAddress} className="h-8 leading-8" />
        </div>
    );
}

function getAttendeesItemContent(index: number, owner: Address) {
    return <AttendeesItem key={`${index}-${owner}`} ownerAddress={owner} />;
}
