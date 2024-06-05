import { memo } from 'react';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import { VirtualListFooterBottomText } from '@/components/VirtualList/VirtualListFooterBottomText.js';

export interface VirtualListFooterProps {
    context?: {
        hasNextPage?: boolean;
        fetchNextPage?: () => Promise<unknown>;
        isFetching?: boolean;
        itemsRendered: boolean;
    };
}
export const VirtualListFooter = memo<VirtualListFooterProps>(function VirtualListFooter({ context }) {
    /**
     * https://github.com/petyosi/react-virtuoso/issues/364
     * Similar to the problem mentioned above, sometimes when loading has already appeared within the window,
     * it does not yet request for the next page.
     */
    const { observe } = useInView({
        rootMargin: '0px 0px',
        onChange: async ({ inView }) => {
            if (inView && context?.hasNextPage && !context.isFetching) {
                context.fetchNextPage?.();
            }
        },
    });

    if (!context?.hasNextPage) return <VirtualListFooterBottomText />;

    if (!context.itemsRendered) return null;

    return (
        <div className="flex items-center justify-center p-2" ref={observe}>
            <LoadingIcon width={16} height={16} className="animate-spin" />
        </div>
    );
});
