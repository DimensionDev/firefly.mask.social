'use client';

import type { UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { type TableComponents } from 'react-virtuoso';

import { NoResultsFallback, type NoResultsFallbackProps } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { VirtualTableList, type VirtualTableListProps } from '@/components/VirtualList/VirtualTableList.js';
import { EMPTY_OBJECT } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface TableListInPageProps<T = unknown, C = unknown> {
    queryResult: UseSuspenseInfiniteQueryResult<T[]>;
    loginRequired?: boolean;
    noResultsFallbackRequired?: boolean;
    VirtualTableListProps?: Omit<VirtualTableListProps<T, C>, 'context'> & {
        context?: Omit<C, 'hasNextPage' | 'fetchNextPage' | 'isFetching' | 'itemsRendered'>;
    };
    NoResultsFallbackProps?: NoResultsFallbackProps;
    className?: string;
}

export function TableListInPage<T = unknown, C = unknown>({
    queryResult,
    loginRequired = false,
    noResultsFallbackRequired = true,
    VirtualTableListProps,
    NoResultsFallbackProps,
    className,
}: TableListInPageProps<T, C>) {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);

    const itemsRendered = useRef(false);
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

    // force type casting to avoid type error
    const List = VirtualTableList<T, C>;
    const Components = (VirtualTableListProps?.components ?? EMPTY_OBJECT) as TableComponents<T, C>;
    const Context = {
        hasNextPage,
        fetchNextPage,
        isFetching,
        itemsRendered: itemsRendered.current,
        ...(VirtualTableListProps?.context ?? EMPTY_OBJECT),
    };

    return (
        <div className={className}>
            <List
                useWindowScroll
                data={data}
                endReached={onEndReached}
                {...VirtualTableListProps}
                itemSize={(el: HTMLElement) => {
                    if (!itemsRendered.current) itemsRendered.current = true;
                    return el.getBoundingClientRect().height;
                }}
                context={Context as C}
                components={Components}
                className={classNames('max-md:no-scrollbar', VirtualTableListProps?.className)}
            />
            <VirtualListFooter context={Context} />
        </div>
    );
}
