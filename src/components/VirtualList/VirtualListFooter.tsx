import { memo } from 'react';
import { Trans } from 'react-i18next';

import LoadingIcon from '@/assets/loading.svg';

interface VirtualListFooterProps {
    context?: {
        hasNextPage?: boolean;
    };
}
export const VirtualListFooter = memo<VirtualListFooterProps>(function VirtualListFooter({ context }) {
    if (!context?.hasNextPage)
        return (
            <div className="flex items-center justify-center p-6 text-base text-secondary">
                <Trans>You&apos;ve hit rock bottom.</Trans>
            </div>
        );
    return (
        <div className="flex items-center justify-center p-2">
            <LoadingIcon width={16} height={16} className="animate-spin" />
        </div>
    );
});
