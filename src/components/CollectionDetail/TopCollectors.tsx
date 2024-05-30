import { Trans } from '@lingui/macro';
import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { TextOverflowTooltip } from '@masknet/theme';
import { SimpleHash } from '@masknet/web3-providers/types';
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm';
import { Tooltip } from '@mui/material';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { Image } from '@/components/Image.js';
import { TableListInPage } from '@/components/TableListInPage.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { formatPercentage } from '@/helpers/formatPercentage.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export interface TopCollectorsProps {
    address: string;
    chainId?: ChainId;
    totalQuantity?: number;
}

export function getTopCollectorsItemContent(
    index: number,
    item: SimpleHash.TopCollector,
    options?: {
        totalQuantity?: number;
    },
) {
    const { totalQuantity } = options || {};
    const addressOrEns = item.owner_ens_name ? item.owner_ens_name : item.owner_address;
    return (
        <>
            <td className="min-w-[40px] pb-5 pr-2 text-left">{index}</td>
            <td className="min-w-[150px] max-w-[200px] px-2 pb-5">
                <div className="flex w-full items-center">
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
            </td>
            <td
                className={classNames('px-2 pb-2 text-right', {
                    'sm:text-center': !!totalQuantity,
                })}
            >
                <div className="min-w-[160px] truncate">
                    <Tooltip title={item.distinct_nfts_owned} placement="right">
                        <span>{nFormatter(item.distinct_nfts_owned)}</span>
                    </Tooltip>
                </div>
            </td>
            {totalQuantity ? (
                <td
                    className="hidden w-[195px] pb-5 pl-2 text-right sm:table-cell"
                    title={`${item.distinct_nfts_owned}`}
                >
                    {formatPercentage(item.distinct_nfts_owned / totalQuantity)}
                </td>
            ) : null}
        </>
    );
}

export function TopCollectors(props: TopCollectorsProps) {
    const { address, chainId = ChainId.Mainnet, totalQuantity } = props;
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
        <TableListInPage
            queryResult={queryResult}
            VirtualTableListProps={{
                components: {
                    // eslint-disable-next-line react/no-unstable-nested-components
                    Table: (props) => <table className="w-full px-3" {...props} />,
                    // eslint-disable-next-line react/no-unstable-nested-components
                    TableRow: (props) => <tr className="text-center text-base font-normal leading-[30px]" {...props} />,
                },
                // eslint-disable-next-line react/no-unstable-nested-components
                fixedHeaderContent: () => {
                    return (
                        <tr className="text-[15px] font-bold leading-6">
                            <th className="pb-2 pr-2 text-left">#</th>
                            <th className="px-2 pb-2 text-left">
                                <Trans>Address</Trans>
                            </th>
                            <th
                                className={classNames('px-2 pb-2 text-right', {
                                    'sm:text-center': !!totalQuantity,
                                })}
                            >
                                <Trans>Owned</Trans>
                            </th>
                            {totalQuantity ? (
                                <th className="hidden w-[195px] whitespace-nowrap pb-2 pl-2 text-right sm:table-cell">
                                    <Trans>%Of supply owned</Trans>
                                </th>
                            ) : null}
                        </tr>
                    );
                },
                key: `${ScrollListKey.TopCollectors}:${address}:${chainId}`,
                computeItemKey: (index, item) =>
                    `${item.owner_address}-${item.owner_ens_name}-${item.owner_address}-${index}`,
                itemContent: (index, item) => getTopCollectorsItemContent(index, item, { totalQuantity }),
            }}
            className="mt-2 w-full"
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
}
