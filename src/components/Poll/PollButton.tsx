import { t } from '@lingui/macro';
import { memo } from 'react';

import PollIcon from '@/assets/poll.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export const PollButton = memo(function PollButton() {
    const { video, images, poll } = useCompositePost();
    const { initPoll } = useComposeStateStore();

    const pollDisabled = !!video || images.length > 0 || !!poll;

    return (
        <Tooltip content={t`Poll`} placement="top" disabled={pollDisabled} className='leading-4'>
            <ClickableButton
                disabled={pollDisabled}
                className={classNames('text-main', pollDisabled ? 'cursor-not-allowed opacity-50' : '')}
                onClick={initPoll}
            >
                <PollIcon width={24} height={24} />
            </ClickableButton>
        </Tooltip>
    );
});
