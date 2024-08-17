import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, useRef } from 'react';

import { ComposeAction } from '@/components/Compose/ComposeAction.js';
import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { ComposeSend } from '@/components/Compose/ComposeSend.js';
import { ComposeThreadContent } from '@/components/Compose/ComposeThreadContent.js';
import { SchedulePostEntryButton } from '@/components/Compose/SchedulePostEntryButton.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { classNames } from '@/helpers/classNames.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function Title() {
    const { type } = useComposeStateStore();

    switch (type) {
        case 'compose':
            return <Trans>Compose</Trans>;
        case 'quote':
            return <Trans>Quote</Trans>;
        case 'reply':
            return <Trans>Reply</Trans>;
        default:
            safeUnreachable(type);
            return <Trans>Compose</Trans>;
    }
}

export const ComposeUI = memo(function ComposeUI() {
    const contentRef = useRef<HTMLDivElement>(null);
    const isMedium = useIsMedium();
    const { posts } = useComposeStateStore();
    const { scheduleTime } = useComposeScheduleStateStore();

    const compositePost = useCompositePost();

    return (
        <>
            <div
                className={classNames(
                    'flex flex-col overflow-auto px-4 pb-4',
                    isMedium ? 'h-full' : 'max-h-[300px] min-h-[300px]',
                )}
            >
                <div
                    ref={contentRef}
                    className="flex h-full flex-1 flex-col overflow-y-auto overflow-x-hidden rounded-lg border border-secondaryLine bg-bg px-4 py-[14px]"
                >
                    {scheduleTime && env.external.NEXT_PUBLIC_SCHEDULE_POST === STATUS.Enabled ? (
                        <SchedulePostEntryButton showText />
                    ) : null}
                    {posts.length === 1 ? <ComposeContent post={compositePost} /> : <ComposeThreadContent />}
                </div>
            </div>

            <ComposeAction />

            {isMedium ? <ComposeSend /> : null}
        </>
    );
});
