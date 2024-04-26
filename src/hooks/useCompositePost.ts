import { useMemo } from 'react';

import { getCompositePost } from '@/helpers/getCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function useCompositePost() {
    const { cursor, posts } = useComposeStateStore();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => getCompositePost(cursor)!, [cursor, posts]);
}
