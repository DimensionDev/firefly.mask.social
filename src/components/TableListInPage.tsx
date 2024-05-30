'use client';

import type { UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { type Components } from 'react-virtuoso';

import { NoResultsFallback, type NoResultsFallbackProps } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { VirtualTableFooter } from '@/components/VirtualList/VirtualTableFooter.js';
import { VirtualTableList, type VirtualTableListProps } from '@/components/VirtualList/VirtualTableList.js';
import { classNames } from '@/helpers/classNames.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface TableListInPageProps<T = unknown> {
    queryResult: UseSuspenseInfiniteQueryResult<T[]>;
    loginRequired?: boolean;
    noResultsFallbackRequired?: boolean;
    VirtualTableListProps?: VirtualTableListProps<T>;
    NoResultsFallbackProps?: NoResultsFallbackProps;
    className?: string;
}

export function TableListInPage<T = unknown>({
    queryResult,
    loginRequired = false,
    noResultsFallbackRequired = true,
    VirtualTableListProps,
    NoResultsFallbackProps,
    className,
}: TableListInPageProps<T>) {
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
    const List = VirtualTableList<T>;
    const Components = {
        TableFoot: VirtualTableFooter,
        ...(VirtualTableListProps?.components ?? {}),
    } as Components<T>;
    const Context = {
        hasNextPage,
        fetchNextPage,
        isFetching,
        itemsRendered: itemsRendered.current,
        ...(VirtualTableListProps?.context ?? {}),
    };

    return (
        <List
            useWindowScroll
            data={data}
            endReached={onEndReached}
            {...VirtualTableListProps}
            itemSize={(el: HTMLElement) => {
                if (!itemsRendered.current) itemsRendered.current = true;
                return el.getBoundingClientRect().height;
            }}
            fixedFooterContent={() => null}
            // eslint-disable-next-line react/no-unstable-nested-components
            context={Context}
            components={Components}
            className={classNames('max-md:no-scrollbar', className)}
        />
    );
}
