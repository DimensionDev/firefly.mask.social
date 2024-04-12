import type { ScrollListKey } from '@/constants/enum.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { floor } from 'lodash-es';
import React, { useEffect, useRef } from 'react';
import { useMount } from 'react-use';
import { Virtuoso, type VirtuosoProps, type VirtuosoHandle } from 'react-virtuoso';

interface VirtualListProps<ItemData = any, Context = any> extends VirtuosoProps<ItemData, Context> {
    listKey?: string;
}

export function VirtualList<ItemData = any, Context = any>({ listKey, ...rest }: VirtualListProps<ItemData, Context>) {
    const { scrollIndexMap, setScrollIndex } = useGlobalState();
    const ref = useRef<VirtuosoHandle>(null);

    useMount(() => {
        if (!listKey) return;
        const index = scrollIndexMap[listKey];

        if (!index) return;
        ref.current?.scrollToIndex(index);
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
