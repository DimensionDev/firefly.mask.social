import { t } from '@lingui/macro';
import { memo } from 'react';

import PollIcon from '@/assets/poll.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export const PollButton = memo(function PollButton() {
    const { video, images, poll } = useCompositePost();
    const { initPoll } = useComposeStateStore();

    const pollDisabled = !!video || images.length > 0 || !!poll;

    const handleCreatePoll = () => {
        if (pollDisabled) return;
        initPoll();
    };

    return (
        <Tooltip content={t`Poll`} placement="top" disabled={pollDisabled}>
            <span
                className={classNames('text-main', pollDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
                onClick={handleCreatePoll}
            >
                <PollIcon width={24} height={24} />
            </span>
        </Tooltip>
    );
});
