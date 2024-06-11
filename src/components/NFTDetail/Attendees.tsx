import { Trans } from '@lingui/macro';
import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { TextOverflowTooltip } from '@masknet/theme';
import { SimpleHash } from '@masknet/web3-providers/types';
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm';
import { Tooltip } from '@mui/material';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { Image } from '@/components/Image.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export interface AttendeesProps {
    address: string;
    chainId?: ChainId;
}

export function Attendees({ address, chainId }: AttendeesProps) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['top-collectors', address],
        async queryFn({ pageParam }) {
            const indicator = createIndicator(undefined, pageParam);
            return SimpleHashWalletProfileProvider.getTopCollectors(address, { indicator, chainId });
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
                    listKey: `${ScrollListKey.TopCollectors}:${chainId}:${address}`,
                    computeItemKey: (index, topCollector) => `${index}-${topCollector.owner_address}`,
                    itemContent: (index, item) => getAttendeesItemContent(index, item),
                }}
            />
        </div>
    );
}

export function getAttendeesItemContent(index: number, item: SimpleHash.TopCollector) {
    const addressOrEns = item.owner_ens_name ? item.owner_ens_name : item.owner_address;
    return (
        <div className="flex items-center justify-between pb-3" key={index}>
            <div className="flex max-w-[calc(100%-110px)] items-center">
                <Image
                    src={getStampAvatarByProfileId(Source.Wallet, addressOrEns)}
                    alt={item.owner_address}
                    width={30}
                    height={30}
                    className="mr-2 min-w-[30px] rounded-full"
                />
                <div className="max-w-[calc(100%-38px)] text-left" title={item.owner_address}>
                    {item.owner_ens_name ? (
                        <TextOverflowTooltip title={addressOrEns} placement="right">
                            <div className="w-full truncate">{item.owner_ens_name}</div>
                        </TextOverflowTooltip>
                    ) : (
                        <Tooltip title={addressOrEns} placement="right">
                            <span>{formatEthereumAddress(item.owner_address, 4)}</span>
                        </Tooltip>
                    )}
                </div>
            </div>
            <Link
                href={resolveProfileUrl(Source.Wallet, item.owner_address)}
                className="h-8 select-none rounded-full bg-lightMain px-4 text-[15px] font-bold leading-8 text-primaryBottom"
            >
                <Trans>Watch</Trans>
            </Link>
        </div>
    );
}
