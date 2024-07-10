'use client';

import type { UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import type { GridComponents } from 'react-virtuoso';

import { NoResultsFallback, type NoResultsFallbackProps } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { VirtualGridList, type VirtualGridListProps } from '@/components/VirtualList/VirtualGridList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { EMPTY_OBJECT } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface GridListInPageProps<T = unknown, C = unknown> {
    queryResult: UseSuspenseInfiniteQueryResult<T[]>;
    loginRequired?: boolean;
    noResultsFallbackRequired?: boolean;
    VirtualGridListProps?: Omit<VirtualGridListProps<T, C>, 'context'> & {
        context?: Omit<C, 'hasNextPage' | 'fetchNextPage' | 'isFetching' | 'itemsRendered'>;
    };
    NoResultsFallbackProps?: NoResultsFallbackProps;
    className?: string;
}

export function GridListInPage<T = unknown, C = unknown>({
    queryResult,
    loginRequired = false,
    noResultsFallbackRequired = true,
    VirtualGridListProps,
    NoResultsFallbackProps,
    className,
}: GridListInPageProps<T, C>) {
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
        ...(VirtualGridListProps?.context ?? EMPTY_OBJECT),
    };
    // force type casting to avoid type error
    const List = VirtualGridList<T, C>;
    const Components = (VirtualGridListProps?.components ?? EMPTY_OBJECT) as GridComponents<C>;

    return (
        <div className={className}>
            <List
                useWindowScroll
                data={data}
                endReached={onEndReached}
                {...VirtualGridListProps}
                context={Context as C}
                components={Components}
                className={classNames('max-md:no-scrollbar', VirtualGridListProps?.className)}
            />
            <VirtualListFooter context={Context} />
        </div>
    );
}
