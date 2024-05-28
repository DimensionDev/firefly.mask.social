import { memo } from 'react';

import { LensHideComments } from '@/components/LensHideComments.js';
import { VirtualListFooter, type VirtualListFooterProps } from '@/components/VirtualList/VirtualListFooter.js';
import { VirtualListFooterBottomText } from '@/components/VirtualList/VirtualListFooterBottomText.js';
import { type SocialSource, Source } from '@/constants/enum.js';

export interface CommentsFooterProps {
    context: VirtualListFooterProps['context'] & {
        source: SocialSource;
        postId: string;
    };
}

export const CommentsFooter = memo<CommentsFooterProps>(function CommentsFooter(props) {
    const { source, postId, ...context } = props.context;
    if (!context?.hasNextPage && source === Source.Lens && postId) {
        return <LensHideComments postId={postId} fallback={<VirtualListFooterBottomText />} />;
    }
    return <VirtualListFooter context={context} />;
});
