'use client';

import { floor } from 'lodash-es';
import React, { useRef } from 'react';
import { useMount } from 'react-use';
import { Virtuoso, type VirtuosoHandle, type VirtuosoProps } from 'react-virtuoso';

import { useGlobalState } from '@/store/useGlobalStore.js';

export interface VirtualListProps<ItemData = unknown, Context = unknown> extends VirtuosoProps<ItemData, Context> {
    listKey?: string;
}

export function VirtualList<ItemData = unknown, Context = unknown>({
    listKey,
    ...rest
}: VirtualListProps<ItemData, Context>) {
    const { scrollIndex, setScrollIndex } = useGlobalState();
    const ref = useRef<VirtuosoHandle>(null);

    useMount(() => {
        if (!listKey) return;
        const index = scrollIndex[listKey];
        if (!index) return;
        // index - 2 is to keep the target as centered as possible.
        ref.current?.scrollToIndex(Math.max(index - 2, 0));
    });

    return (
        <Virtuoso
            ref={ref}
            {...rest}
            rangeChanged={({ startIndex, endIndex }) => {
                if (!listKey) return;
                setScrollIndex(listKey, floor((endIndex - startIndex) / 2));
            }}
        />
    );
}
