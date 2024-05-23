import { Trans } from '@lingui/macro';
import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { SimpleHash } from '@masknet/web3-providers/types';
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { Image } from '@/components/Image.js';
import { TableListInPage } from '@/components/TableListInPage.js';
import { ScrollListKey } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
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
    return (
        <>
            <td className="min-w-[55px] pb-5 pr-2 text-left">{index}</td>
            <td
                className="max-w-[120px] px-2 pb-5"
                title={item.owner_ens_name ? item.owner_ens_name : item.owner_address}
            >
                <div className="flex w-full items-center">
                    <Image
                        src={item.owner_image}
                        alt={item.owner_address}
                        width={30}
                        height={30}
                        className="mr-2 rounded-full"
                    />
                    <div className="max-w-[calc(100%-38px)] truncate text-left">
                        {item.owner_ens_name ? item.owner_ens_name : formatEthereumAddress(item.owner_address, 4)}
                    </div>
                </div>
            </td>
            <td
                className={classNames('px-2 pb-2 text-right', {
                    'sm:text-center': !!totalQuantity,
                })}
            >
                {item.total_copies_owned}
            </td>
            {totalQuantity ? (
                <td
                    className="hidden w-[195px] pb-5 pl-2 text-right sm:table-cell"
                    title={`${item.distinct_nfts_owned}`}
                >
                    {((item.distinct_nfts_owned / totalQuantity) * 100).toFixed(2).replace(/\.0+$/, '')}%
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
                                <th className="hidden w-[195px] pb-2 pl-2 text-right sm:table-cell">
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
