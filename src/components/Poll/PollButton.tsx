import { t } from '@lingui/macro';
import { memo } from 'react';

import PollIcon from '@/assets/poll.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { SORTED_POLL_SOURCES } from '@/constants/index.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { hasRpPayload } from '@/helpers/rpPayload.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export const PollButton = memo(function PollButton() {
    const { video, images, poll, availableSources, typedMessage } = useCompositePost();
    const { createPoll } = useComposeStateStore();

    const isPollSupported =
        availableSources.length > 0 && availableSources.every((x) => SORTED_POLL_SOURCES.includes(x));
    const hasConflictContent = !!video || images.length > 0 || !!poll || !!hasRpPayload(typedMessage);

    return (
        <Tooltip
            content={
                !isPollSupported
                    ? t`Poll is currently only supported on ${SORTED_POLL_SOURCES.map(resolveSourceName).join(', ')}`
                    : t`Poll`
            }
            placement="top"
            disabled={!isPollSupported ? false : hasConflictContent}
        >
            <ClickableButton
                disabled={!isPollSupported || hasConflictContent}
                className="leading-4 text-main"
                onClick={createPoll}
            >
                <PollIcon width={24} height={24} />
            </ClickableButton>
        </Tooltip>
    );
});
