'use client';

import React from 'react';
import { useWindowSize } from 'react-use';
import { TableVirtuoso, type TableVirtuosoProps } from 'react-virtuoso';

import { useGlobalState } from '@/store/useGlobalStore.js';

export interface VirtualTableListProps<ItemData = unknown, Context = unknown>
    extends TableVirtuosoProps<ItemData, Context> {
    listKey?: string;
}

export function VirtualTableList<ItemData = unknown, Context = unknown>({
    listKey,
    ...rest
}: VirtualTableListProps<ItemData, Context>) {
    const { height } = useWindowSize();
    const { scrollIndex } = useGlobalState();
    return (
        <TableVirtuoso
            initialTopMostItemIndex={listKey && scrollIndex[listKey] ? Math.max(scrollIndex[listKey] - 2, 0) : 0}
            overscan={height}
            increaseViewportBy={height}
            {...rest}
        />
    );
}
