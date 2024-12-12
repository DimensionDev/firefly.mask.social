'use client';

import { t } from '@lingui/macro';
import { isValidChainId as isSolanaChainId } from '@masknet/web3-shared-solana';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { forwardRef } from 'react';
import type { GridItemProps, GridListProps } from 'react-virtuoso';

import { GridListInPage } from '@/components/GridListInPage.js';
import { Image } from '@/components/Image.js';
import { ChainIcon } from '@/components/NFTDetail/ChainIcon.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueMessageFromError } from '@/helpers/enqueueMessage.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveNFTImageUrl } from '@/helpers/resolveNFTImageUrl.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveSimpleHashChainId } from '@/helpers/resolveSimpleHashChain.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { NftPreview } from '@/providers/types/Firefly.js';

function getNFTItemContent(nft: NftPreview) {
    const chainId = resolveSimpleHashChainId(nft.chain);

    const content = (
        <>
            <div className="relative aspect-square h-auto w-full overflow-hidden">
                <Image
                    src={resolveNFTImageUrl(nft)}
                    alt={nft.name}
                    width={500}
                    height={500}
                    className="h-full w-full rounded-lg object-cover"
                />
                {chainId ? <ChainIcon size={20} chainId={chainId} className="absolute left-1 top-1" /> : null}
            </div>
            <div className="mt-1 line-clamp-2 h-8 w-full px-1 text-center text-xs leading-4 sm:mt-2 sm:px-2 sm:py-0">
                {nft.name}
            </div>
        </>
    );

    return chainId ? (
        <Link
            className="flex cursor-pointer flex-col rounded-lg bg-bg pb-1 sm:rounded-2xl"
            href={resolveNftUrl(chainId, nft.contract_address, isSolanaChainId(chainId) ? '0' : nft.token_id)}
        >
            {content}
        </Link>
    ) : (
        <div className="flex cursor-pointer flex-col rounded-lg bg-bg pb-1 sm:rounded-2xl">{content}</div>
    );
}

const GridList = forwardRef<HTMLDivElement, GridListProps>(function GridList({ className, children, ...props }, ref) {
    return (
        <div
            ref={ref}
            {...props}
            className={classNames('grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4', className)}
        >
            {children}
        </div>
    );
});

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(function GridItem({ children, ...props }, ref) {
    return <div {...props}>{children}</div>;
});

export function NFTBookmarkList() {
    const currentProfileAll = useCurrentProfileAll();
    const isLogin = useIsLogin();

    useNavigatorTitle(t`NFT bookmarks`);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['bookmarks', Source.NFTs, SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId)],
        queryFn: async ({ pageParam }) => {
            if (!isLogin) return;
            try {
                return await FireflySocialMediaProvider.getNFTBookmarks(createIndicator(undefined, pageParam));
            } catch (error) {
                enqueueMessageFromError(error, t`Failed to fetch bookmarks.`);
                throw error;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select: (data) => compact(data.pages.flatMap((x) => x?.data)),
    });

    if (!isLogin) {
        return <NotLoginFallback source={Source.Polymarket} />;
    }

    return (
        <GridListInPage
            queryResult={queryResult}
            VirtualGridListProps={{
                components: {
                    List: GridList,
                    Item: GridItem,
                },
                itemContent: (index, item) => {
                    return getNFTItemContent(item);
                },
            }}
        />
    );
}
