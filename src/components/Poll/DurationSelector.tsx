import { t } from '@lingui/macro';
import { last } from 'lodash-es';

import { NumberSelector } from '@/components/Poll/NumberSelector.js';
import { POLL_DURATION_DAYS_LIST, POLL_DURATION_MIN_MINUTES } from '@/constants/poll.js';
import type { CompositePoll } from '@/providers/types/Poll.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface DurationSelectorProps {
    poll: CompositePoll;
    readonly?: boolean;
}

type Duration = CompositePoll['duration'];

const getValidDuration = (type: keyof Duration, { days, hours, minutes }: Duration) => {
    if (!days && !hours && !minutes) {
        return { days: 0, hours: type === 'days' ? 1 : 0, minutes: type === 'hours' ? POLL_DURATION_MIN_MINUTES : 0 };
    }
    if (!days && !hours) {
        return { days: 0, hours: 0, minutes: Math.max(POLL_DURATION_MIN_MINUTES, minutes) };
    }
    if (days === last(POLL_DURATION_DAYS_LIST)) {
        return { days, hours: 0, minutes: 0 };
    }
    return { days, hours, minutes };
};

export function DurationSelector({ poll, readonly }: DurationSelectorProps) {
    const { updatePoll } = useComposeStateStore();

    const { days, hours, minutes } = poll.duration;

    const minMinutes = !days && !hours ? POLL_DURATION_MIN_MINUTES : 0;
    const maxDays = last(POLL_DURATION_DAYS_LIST);

    const updateDuration = (type: keyof Duration, value: number) => {
        switch (type) {
            case 'days':
                updatePoll({ ...poll, duration: getValidDuration(type, { days: value, hours, minutes }) });
                break;
            case 'hours':
                updatePoll({ ...poll, duration: getValidDuration(type, { days, hours: value, minutes }) });
                break;
            case 'minutes':
                updatePoll({ ...poll, duration: getValidDuration(type, { days, hours, minutes: value }) });
                break;
            default:
                break;
        }
    };

    return (
        <div className="mt-4 flex justify-between gap-2">
            <NumberSelector
                disabled={readonly}
                className="flex-1"
                label={t`Days`}
                value={days}
                numbers={POLL_DURATION_DAYS_LIST}
                onChange={(value) => updateDuration('days', value)}
            />
            <NumberSelector
                disabled={readonly || days === maxDays}
                className="flex-1"
                label={t`Hours`}
                value={hours}
                numbers={{ min: 0, max: 23 }}
                onChange={(value) => updateDuration('hours', value)}
            />
            <NumberSelector
                disabled={readonly || days === maxDays}
                className="flex-1"
                label={t`Minutes`}
                value={minutes}
                numbers={{ min: minMinutes, max: 59 }}
                onChange={(value) => updateDuration('minutes', value)}
            />
        </div>
    );
}
