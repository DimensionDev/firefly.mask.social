import { createIndicator } from '@masknet/shared-base';
import { SimpleHashEVM } from '@masknet/web3-providers';
import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import { ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { forwardRef } from 'react';
import type { GridItemProps, GridListProps } from 'react-virtuoso';

import PoapIcon from '@/assets/poap.svg';
import { GridListInPage } from '@/components/GridListInPage.js';
import { Image } from '@/components/Image.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';

const GridList = forwardRef<HTMLDivElement, GridListProps>(function GridList({ className, children, ...props }, ref) {
    return (
        <div ref={ref} {...props} className={classNames('grid grid-cols-3 gap-3.5 px-5', className)}>
            {children}
        </div>
    );
});

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(function GridItem({ children, ...props }, ref) {
    return <div {...props}>{children}</div>;
});

function getItemContent(index: number, item: NonFungibleAsset<ChainId.Mainnet, SchemaType.ERC721>) {
    return (
        <Link
            href={`/nft/${item.id}/${item.tokenId}`}
            key={`${index}-${item.id}-${item.tokenId}`}
            className="flex flex-col rounded-lg bg-lightBg pb-1 sm:rounded-2xl sm:border sm:border-line sm:bg-white sm:p-2.5 sm:dark:bg-black"
        >
            <div className="relative aspect-square h-auto w-full overflow-hidden">
                <PoapIcon className="absolute left-0 top-0 h-6 w-6" />
                <Image
                    width={500}
                    height={500}
                    className="h-full w-full rounded-lg object-cover sm:rounded-xl"
                    src={item.metadata?.imageURL ?? ''}
                    alt="nft_image"
                />
            </div>
            <div className="mt-1 line-clamp-2 h-8 w-full px-1 text-center text-xs font-medium leading-4 sm:mt-2 sm:px-2 sm:py-0">
                {item.metadata?.name}
            </div>
        </Link>
    );
}

export function POAPList(props: { address: string }) {
    const { address } = props;
    const queryResult = useSuspenseInfiniteQuery({
        initialPageParam: '',
        queryKey: ['poap-list', address],
        async queryFn({ pageParam }) {
            const indicator = createIndicator(undefined, pageParam);
            return SimpleHashEVM.getAssets(address!, { indicator });
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page.data ?? []),
    });

    return (
        <GridListInPage
            queryResult={queryResult}
            className="mt-5"
            VirtualGridListProps={{
                components: {
                    List: GridList,
                    Item: GridItem,
                },
                itemContent: (index, item) => {
                    return getItemContent(index, item as NonFungibleAsset<ChainId.Mainnet, SchemaType.ERC721>);
                },
            }}
        />
    );
}
