import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { POLL_CHOICE_TYPE } from '@/constants/poll.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { CreatePollRequest, CreatePollResponse, Poll } from '@/providers/types/Poll.js';

export const commitPoll = async (poll: Poll, text: string): Promise<Poll> => {
    const request: CreatePollRequest = {
        title: text,
        choices: poll.options.map((x) => x.label),
        type: poll.type,
        sub_time: poll.durationSeconds,
        strategies: poll.strategies,
    };

    if (poll.type === POLL_CHOICE_TYPE.Multiple) {
        request.multiple_count = poll.multiple_count;
    }

    const response = await fetchJSON<CreatePollResponse>(urlcat(FIREFLY_ROOT_URL, '/v1/vote_frame/poll/create'), {
        method: 'POST',
        body: JSON.stringify(request),
    });

    if (!response.data?.poll_id) throw new Error('Failed to create poll');

    return {
        ...poll,
        id: response.data.poll_id,
    };
};
