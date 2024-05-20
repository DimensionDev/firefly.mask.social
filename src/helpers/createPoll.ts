import { v4 as uuid } from 'uuid';

import { type SocialSource, Source } from '@/constants/enum.js';
import {
    POLL_DEFAULT_VALID_IN_DAYS,
    POLL_MAX_VALID_IN_DAYS,
    POLL_OPTIONS_MAX_COUNT,
    POLL_OPTIONS_MIN_COUNT,
} from '@/constants/poll.js';
import { trimify } from '@/helpers/trimify.js';
import type { Poll,PollPureOption } from '@/providers/types/Poll.js';

export const createPollInitOption = (): PollPureOption => {
    return { id: uuid(), label: '' };
};

export const createInitPurePoll = () => {
    return {
        validInDays: POLL_DEFAULT_VALID_IN_DAYS,
        options: Array.from({ length: POLL_OPTIONS_MIN_COUNT }).map(() => createPollInitOption()),
    };
};

export const getPollOptionsMaxLength = (availableSources: SocialSource[]) => {
    if (availableSources.length === 1 && availableSources[0] === Source.Lens) {
        return POLL_OPTIONS_MAX_COUNT[Source.Lens];
    }
    return POLL_OPTIONS_MAX_COUNT[Source.Farcaster];
};

export const shouldShowCustomDaysInput = (availableSources: SocialSource[]) => {
    if (availableSources.length === 1 && availableSources[0] === Source.Twitter) {
        return false;
    }
    return true;
};

export const isValidPoll = (poll: Poll) => {
    if (!poll.options.length) return false;
    if (poll.options.some((o) => !trimify(o.label))) return false;
    return true;
};

export const getPollFixedValidInDays = (validInDays: number, source: SocialSource) => {
    const maxDays = POLL_MAX_VALID_IN_DAYS[source];
    return Math.min(maxDays, validInDays);
};
