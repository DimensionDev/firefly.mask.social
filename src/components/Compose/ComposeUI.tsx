import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, useRef, useState } from 'react';

import { ComposeAction } from '@/components/Compose/ComposeAction.js';
import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { ComposeSend } from '@/components/Compose/ComposeSend.js';
import { ComposeThreadContent } from '@/components/Compose/ComposeThreadContent.js';
import { SchedulePostEntryButton } from '@/components/Compose/SchedulePostEntryButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
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
    const [warningsOpen, setWarningsOpen] = useState(true);

    return (
        <>
            <div className="flex flex-col overflow-auto px-4 pb-4">
                <div
                    ref={contentRef}
                    className="flex max-h-[300px] min-h-[300px] flex-1 flex-col overflow-auto rounded-lg border border-secondaryLine bg-bg px-4 py-[14px] md:max-h-[500px] md:min-h-[338px]"
                >
                    {scheduleTime && env.external.NEXT_PUBLIC_SCHEDULE_POST === STATUS.Enabled ? (
                        <SchedulePostEntryButton showText />
                    ) : null}
                    {posts.length === 1 ? <ComposeContent post={compositePost} /> : <ComposeThreadContent />}
                </div>
            </div>

            <ComposeAction />

            {warningsOpen && env.external.NEXT_PUBLIC_COMPOSE_WARNINGS === STATUS.Enabled ? (
                <div className="flex w-full items-center justify-center gap-2 bg-orange-400 p-2">
                    <ExclamationTriangleIcon className="hidden text-white md:block" width={24} height={24} />
                    <p className="text-left text-xs text-white md:text-center">
                        <Trans>We&apos;re updating our connection with X. Posting on X will be limited for now.</Trans>
                    </p>
                    <Tooltip content={t`Close`} placement="top">
                        <XCircleIcon
                            className="cursor-pointer text-white"
                            width={24}
                            height={24}
                            onClick={() => setWarningsOpen(false)}
                        />
                    </Tooltip>
                </div>
            ) : null}

            {isMedium ? <ComposeSend /> : null}
        </>
    );
});
