import { useMemo } from 'react';

import { getCompositePost } from '@/helpers/getCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function useCompositePost(id?: string) {
    const { cursor, posts } = useComposeStateStore();

    return useMemo(() => getCompositePost(id ?? cursor)!, [id, cursor, posts]);
}
