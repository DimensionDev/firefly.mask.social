'use client';

import React from 'react';
import { useWindowSize } from 'react-use';
import { VirtuosoGrid, type VirtuosoGridProps } from 'react-virtuoso';

import { useGlobalState } from '@/store/useGlobalStore.js';

export interface VirtualGridListProps<ItemData = unknown, Context = unknown>
    extends VirtuosoGridProps<ItemData, Context> {
    listKey?: string;
}

export function VirtualGridList<ItemData = unknown, Context = unknown>({
    listKey,
    ...rest
}: VirtualGridListProps<ItemData, Context>) {
    const { height } = useWindowSize();
    const { scrollIndex } = useGlobalState();
    return (
        <VirtuosoGrid
            initialTopMostItemIndex={listKey && scrollIndex[listKey] ? Math.max(scrollIndex[listKey] - 2, 0) : 0}
            overscan={height}
            {...rest}
        />
    );
}
