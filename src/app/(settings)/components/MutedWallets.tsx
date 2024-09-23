import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { WalletItem } from '@/components/WalletItem.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { createIndicator } from '@/helpers/pageable.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Relationship } from '@/providers/types/Firefly.js';

const getMutedWalletItem = (index: number, relation: Relationship, listKey: string) => {
    return <WalletItem relation={relation} key={`${listKey}-${index}`} />;
};

export function MutedWallets() {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['wallets', 'muted-list'],
        queryFn: async ({ pageParam }) => {
            const indicator = pageParam ? createIndicator(undefined, pageParam) : undefined;
            return await FireflySocialMediaProvider.getBlockedWallets(indicator);
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    return (
        <ListInPage
            key={Source.Wallet}
            queryResult={queryResult}
            className="no-scrollbar"
            VirtualListProps={{
                useWindowScroll: false,
                listKey: `${ScrollListKey.Profile}:muted`,
                computeItemKey: (index, relation) => `${relation.address}-${index}`,
                itemContent: (index, relation) => getMutedWalletItem(index, relation, `${ScrollListKey.Profile}:muted`),
            }}
            NoResultsFallbackProps={{
                className: 'mt-20',
            }}
        />
    );
}
