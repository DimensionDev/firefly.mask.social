'use client';

import React from 'react';
import { useWindowSize } from 'react-use';
import { Virtuoso, type VirtuosoHandle, type VirtuosoProps } from 'react-virtuoso';

export interface VirtualListProps<ItemData = unknown, Context = unknown> extends VirtuosoProps<ItemData, Context> {
    listKey?: string;
    virtuosoRef?: React.RefObject<VirtuosoHandle>;
}

export function VirtualList<ItemData = unknown, Context = unknown>({
    listKey,
    ...rest
}: VirtualListProps<ItemData, Context>) {
    const { height } = useWindowSize();
    return <Virtuoso overscan={height} increaseViewportBy={height} {...rest} ref={rest.virtuosoRef} />;
}
