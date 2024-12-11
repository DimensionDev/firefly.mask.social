'use client';

import React, { useMemo } from 'react';
import { useWindowSize } from 'react-use';
import { Virtuoso, type VirtuosoHandle, type VirtuosoProps } from 'react-virtuoso';

export interface VirtualListProps<ItemData = unknown, Context = unknown> extends VirtuosoProps<ItemData, Context> {
    listKey?: string;
    virtuosoRef?: React.RefObject<VirtuosoHandle>;
}

export function VirtualList<ItemData = unknown, Context = unknown>({
    listKey,
    virtuosoRef,
    ...rest
}: VirtualListProps<ItemData, Context>) {
    const { height } = useWindowSize();
    return useMemo(
        () => <Virtuoso overscan={height} increaseViewportBy={height} {...rest} ref={virtuosoRef} />,
        [height, rest, virtuosoRef],
    );
}
