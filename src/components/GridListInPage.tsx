'use client';

import type { UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import type { GridComponents } from 'react-virtuoso';

import { NoResultsFallback, type NoResultsFallbackProps } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { VirtualGridList, type VirtualGridListProps } from '@/components/VirtualList/VirtualGridList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { classNames } from '@/helpers/classNames.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface GridListInPageProps<T = unknown> {
    queryResult: UseSuspenseInfiniteQueryResult<T[]>;
    loginRequired?: boolean;
    noResultsFallbackRequired?: boolean;
    VirtualGridListProps?: VirtualGridListProps<T>;
    NoResultsFallbackProps?: NoResultsFallbackProps;
    className?: string;
}

export function GridListInPage<T = unknown>({
    queryResult,
    loginRequired = false,
    noResultsFallbackRequired = true,
    VirtualGridListProps,
    NoResultsFallbackProps,
    className,
}: GridListInPageProps<T>) {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);

    const itemsRendered = useRef(true);
    const isLogin = useIsLogin(currentSocialSource);

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = queryResult;

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }
        await fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

    if (loginRequired && !isLogin) {
        return <NotLoginFallback source={currentSocialSource} />;
    }

    if (noResultsFallbackRequired && !data.length) {
        return <NoResultsFallback {...NoResultsFallbackProps} />;
    }

    const Context = {
        hasNextPage,
        fetchNextPage,
        isFetching,
        itemsRendered: itemsRendered.current,
        ...(VirtualGridListProps?.context ?? {}),
    };
    // force type casting to avoid type error
    const List = VirtualGridList<T, typeof Context>;
    const Components = {
        Footer: VirtualListFooter,
        ...(VirtualGridListProps?.components ?? {}),
    } as GridComponents<typeof Context>;

    return (
        <List
            useWindowScroll
            data={data}
            endReached={onEndReached}
            {...VirtualGridListProps}
            context={Context}
            components={Components}
            className={classNames('max-md:no-scrollbar', className)}
        />
    );
}
