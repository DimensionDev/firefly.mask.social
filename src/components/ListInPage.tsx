'use client';

import type { UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import type { Components, StateSnapshot, VirtuosoHandle } from 'react-virtuoso';

import { NoResultsFallback, type NoResultsFallbackProps } from '@/components/NoResultsFallback.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { VirtualList, type VirtualListProps } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ListInPageProps<T = unknown, C = unknown> {
    queryResult: UseSuspenseInfiniteQueryResult<T[]>;
    loginRequired?: boolean;
    noResultsFallbackRequired?: boolean;
    VirtualListProps?: Omit<VirtualListProps<T, C>, 'context'> & {
        context?: Omit<C, 'hasNextPage' | 'fetchNextPage' | 'isFetching' | 'itemsRendered'>;
    };
    NoResultsFallbackProps?: NoResultsFallbackProps;
    className?: string;
    source: Source;
}

export function ListInPage<T = unknown, C = unknown>({
    queryResult,
    loginRequired = false,
    noResultsFallbackRequired = true,
    VirtualListProps,
    NoResultsFallbackProps,
    className,
    source,
}: ListInPageProps<T, C>) {
    const isNotSocialSource = source === Source.Article || source === Source.DAOs;

    const { virtuosoState, setVirtuosoState } = useGlobalState();
    const currentSocialSource = narrowToSocialSource(source);
    const isLogin = useIsLogin(isNotSocialSource ? undefined : currentSocialSource);

    const itemsRendered = useRef(false);

    const virtuoso = useRef<VirtuosoHandle>(null);

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = queryResult;

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }
        await fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

    if (loginRequired && !isLogin) {
        return <NotLoginFallback source={isNotSocialSource ? source : currentSocialSource} />;
    }

    if (noResultsFallbackRequired && !data.length) {
        return <NoResultsFallback {...NoResultsFallbackProps} />;
    }

    const listKey = VirtualListProps?.listKey;

    const onScrolling = (scrolling: boolean) => {
        if (!scrolling && listKey) {
            virtuoso.current?.getState((state: StateSnapshot) => {
                setVirtuosoState('temporary', listKey, state);
            });
        }
    };

    // force type casting to avoid type error
    const List = VirtualList<T, C>;
    const Components = {
        Footer: VirtualListFooter,
        ...(VirtualListProps?.components ?? {}),
    } as Components<T, C>;
    const Context = {
        hasNextPage,
        fetchNextPage,
        isFetching,
        itemsRendered: itemsRendered.current,
        ...(VirtualListProps?.context ?? {}),
    };
    const cachedState = listKey ? virtuosoState.cached[listKey] : undefined;

    return (
        <List
            useWindowScroll
            data={data}
            endReached={onEndReached}
            itemSize={(el: HTMLElement) => {
                if (!itemsRendered.current) itemsRendered.current = true;
                return el.getBoundingClientRect().height;
            }}
            {...(VirtualListProps as VirtualListProps<T, C>)}
            key={VirtualListProps?.listKey}
            context={Context as C}
            components={Components}
            className={classNames('max-md:no-scrollbar', className)}
            isScrolling={onScrolling}
            restoreStateFrom={cachedState}
            virtuosoRef={virtuoso}
        />
    );
}
