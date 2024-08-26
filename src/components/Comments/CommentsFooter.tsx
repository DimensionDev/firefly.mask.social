import { memo } from 'react';

import { HideComments } from '@/components/HideComments.js';
import { VirtualListFooter, type VirtualListFooterProps } from '@/components/VirtualList/VirtualListFooter.js';
import { VirtualListFooterBottomText } from '@/components/VirtualList/VirtualListFooterBottomText.js';
import { type SocialSource } from '@/constants/enum.js';
import type { NonUndefined } from '@/types/index.js';

interface Context extends NonUndefined<VirtualListFooterProps['context']> {
    source: SocialSource;
    postId: string;
}

export interface CommentsFooterProps {
    context?: Context;
}

export const CommentsFooter = memo<CommentsFooterProps>(function CommentsFooter(props) {
    if (!props.context) return null;
    const { source, postId, ...context } = props.context;
    if (!context?.hasNextPage && postId) {
        return <HideComments source={source} postId={postId} fallback={<VirtualListFooterBottomText />} />;
    }
    return <VirtualListFooter context={context} />;
});
