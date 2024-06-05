import { v4 as uuid } from 'uuid';

import { type SocialSource } from '@/constants/enum.js';
import {
    POLL_DEFAULT_VALID_IN_DAYS,
    POLL_MAX_VALID_IN_DAYS,
    POLL_OPTIONS_MAX_COUNT,
    POLL_OPTIONS_MIN_COUNT,
} from '@/constants/poll.js';
import { trimify } from '@/helpers/trimify.js';
import type { CompositePoll, PollOption } from '@/providers/types/Poll.js';

export const createPollOption = (): PollOption => {
    return { id: uuid(), label: '' };
};

export const createPoll = (): CompositePoll => {
    return {
        validInDays: POLL_DEFAULT_VALID_IN_DAYS,
        options: Array.from({ length: POLL_OPTIONS_MIN_COUNT }).map(() => createPollOption()),
    };
};

export const getPollOptionsMaxLength = (availableSources: SocialSource[]) => {
    return Math.min(...availableSources.map((x) => POLL_OPTIONS_MAX_COUNT[x]));
};

export const isValidPoll = (poll: CompositePoll) => {
    if (!poll.options.length) return false;
    if (poll.options.some((o) => !trimify(o.label))) return false;
    return true;
};

export const getPollFixedValidInDays = (validInDays: number, source: SocialSource) => {
    const maxDays = POLL_MAX_VALID_IN_DAYS[source];
    return Math.min(maxDays, validInDays);
};
