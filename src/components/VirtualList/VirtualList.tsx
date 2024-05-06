'use client';

import React from 'react';
import { useWindowSize } from 'react-use';
import { Virtuoso, type VirtuosoProps } from 'react-virtuoso';

import { useGlobalState } from '@/store/useGlobalStore.js';

export interface VirtualListProps<ItemData = unknown, Context = unknown> extends VirtuosoProps<ItemData, Context> {
    listKey?: string;
}

export function VirtualList<ItemData = unknown, Context = unknown>({
    listKey,
    ...rest
}: VirtualListProps<ItemData, Context>) {
    const { height } = useWindowSize();
    const { scrollIndex } = useGlobalState();
    return (
        <Virtuoso
            initialTopMostItemIndex={listKey && scrollIndex[listKey] ? Math.max(scrollIndex[listKey] - 2, 0) : 0}
            overscan={height}
            increaseViewportBy={height}
            {...rest}
        />
    );
}
