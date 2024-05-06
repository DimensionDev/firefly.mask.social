'use client';

import type { UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import type { Components } from 'react-virtuoso';

import { NoResultsFallback, type NoResultsFallbackProps } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { VirtualList, type VirtualListProps } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ListInPageProps<T = unknown> {
    queryResult: UseSuspenseInfiniteQueryResult<T[]>;
    loginRequired?: boolean;
    noResultsFallbackRequired?: boolean;
    VirtualListProps?: VirtualListProps<T>;
    NoResultsFallbackProps?: NoResultsFallbackProps;
}

export function ListInPage<T = unknown>({
    queryResult,
    loginRequired = false,
    noResultsFallbackRequired = true,
    VirtualListProps,
    NoResultsFallbackProps,
}: ListInPageProps<T>) {
    const itemsRendered = useRef(false);
    const currentSource = useGlobalState.use.currentSource();
    const isLogin = useIsLogin(currentSource);

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = queryResult;

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }
        await fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

    if (loginRequired && !isLogin) {
        return <NotLoginFallback source={currentSource} />;
    }

    if (noResultsFallbackRequired && !data.length) {
        return <NoResultsFallback {...NoResultsFallbackProps} />;
    }

    // force type casting to avoid type error
    const List = VirtualList<T>;
    const Components = {
        Footer: VirtualListFooter,
        ...(VirtualListProps?.components ?? {}),
    } as Components<T>;
    const Context = {
        hasNextPage,
        fetchNextPage,
        isFetching,
        itemsRendered: itemsRendered.current,
        ...(VirtualListProps?.context ?? {}),
    };

    return (
        <List
            useWindowScroll
            data={data}
            endReached={onEndReached}
            itemSize={(el: HTMLElement) => {
                if (!itemsRendered.current) itemsRendered.current = true;

                return el.getBoundingClientRect().height;
            }}
            {...VirtualListProps}
            context={Context}
            components={Components}
            className={'max-md:no-scrollbar'}
        />
    );
}
