import { useMemo } from 'react';

import { getCompositePost } from '@/helpers/getCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function useCompositePost() {
    const { cursor } = useComposeStateStore();

    return useMemo(() => getCompositePost(cursor)!, [cursor]);
}
