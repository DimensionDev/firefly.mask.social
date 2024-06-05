import urlcat from 'urlcat';

import { FRAME_SERVER_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { Poll } from '@/providers/types/Poll.js';
import type { ResponseJSON } from '@/types/index.js';

type CreatePollResponse = ResponseJSON<{ pollId: string }>;

export const commitPoll = async (poll: Poll, text: string): Promise<Poll> => {
    const pollStub = {
        options: poll.options.map((x) => ({
            id: x.id,
            label: x.label,
        })),
        validInDays: poll.validInDays,
        source: poll.source.toLowerCase(),
    };

    const response = await fetchJSON<CreatePollResponse>(urlcat(FRAME_SERVER_URL, '/api/poll'), {
        method: 'POST',
        body: JSON.stringify({
            text,
            poll: pollStub,
        }),
    });
    if (!response.success) throw new Error(response.error.message);
    return {
        ...poll,
        id: response.data.pollId,
    };
};
