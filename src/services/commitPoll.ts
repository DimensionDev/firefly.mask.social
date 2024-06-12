import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { POLL_CHOICE_TYPE } from '@/constants/poll.js';
import { getPollDurationSeconds } from '@/helpers/polls.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { CompositePoll, CreatePollRequest, CreatePollResponse } from '@/providers/types/Poll.js';

export const commitPoll = async (poll: CompositePoll, text: string): Promise<string> => {
    const request: CreatePollRequest = {
        title: text,
        choices: poll.options.map((x) => x.label),
        type: poll.type,
        sub_time: getPollDurationSeconds(poll.duration),
        strategies: poll.strategies,
    };

    if (poll.type === POLL_CHOICE_TYPE.Multiple) {
        request.multiple_count = poll.multiple_count;
    }

    const response = await fireflySessionHolder.fetch<CreatePollResponse>(
        urlcat(FIREFLY_ROOT_URL, '/v1/vote_frame/poll/create'),
        {
            method: 'POST',
            body: JSON.stringify(request),
        },
    );

    if (!response.data?.poll_id) throw new Error('Failed to create poll');

    return response.data.poll_id;
};
