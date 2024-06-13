'use client';

import { Trans } from '@lingui/macro';
import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { TextOverflowTooltip } from '@masknet/theme';
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm';
import { Tooltip } from '@mui/material';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { uniq } from 'lodash-es';
import type { Address } from 'viem';
import { useEnsName } from 'wagmi';

import LinkIcon from '@/assets/link-square.svg';
import { Image } from '@/components/Image.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export interface AttendeesProps {
    eventId: number;
}

export function Attendees({ eventId }: AttendeesProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['poap-event-owners', eventId],
        async queryFn({ pageParam }) {
            const indicator = createIndicator(undefined, pageParam);
            const result = await SimpleHashWalletProfileProvider.getPoapEvent(eventId, { indicator });
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
            <h3 className="text-lg font-bold leading-6">
                <Trans>Attendees</Trans>
            </h3>
            <ListInPage
                queryResult={queryResult}
                VirtualListProps={{
                    listKey: `${ScrollListKey.TopCollectors}:${eventId}`,
                    computeItemKey: (index, owner) => `${index}-${owner}`,
                    itemContent: (index, owner) => getAttendeesItemContent(index, owner),
                }}
            />
        </div>
    );
}

function AttendeesItem({ ownerAddress }: { ownerAddress: string }) {
    const { data: ensName } = useEnsName({ address: ownerAddress as Address, chainId: ChainId.Mainnet });
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
                    className="mr-2 min-w-[30px] rounded-full"
                />
                <div className="flex max-w-[calc(100%-38px)] items-center text-left" title={ownerAddress}>
                    {ensName ? (
                        <TextOverflowTooltip title={addressOrEns} placement="right">
                            <div className="w-full truncate">{ensName}</div>
                        </TextOverflowTooltip>
                    ) : (
                        <Tooltip title={addressOrEns} placement="right">
                            <span>{formatEthereumAddress(ownerAddress, 4)}</span>
                        </Tooltip>
                    )}
                    <LinkIcon className="ml-1.5 h-3 w-3 text-secondary" />
                </div>
            </Link>
            <Link
                href={resolveProfileUrl(Source.Wallet, ownerAddress)}
                className="h-8 select-none rounded-full bg-lightMain px-4 text-[15px] font-bold leading-8 text-primaryBottom"
            >
                <Trans>Watch</Trans>
            </Link>
        </div>
    );
}

function getAttendeesItemContent(index: number, owner: string) {
    return <AttendeesItem key={`${index}-${owner}`} ownerAddress={owner} />;
}
