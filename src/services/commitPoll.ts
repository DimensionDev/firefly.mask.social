import urlcat from 'urlcat';

import { type SocialSource } from '@/constants/enum.js';
import { POLL_CHOICE_TYPE } from '@/constants/poll.js';
import { formatFireflyPoll } from '@/helpers/formatFireflyPoll.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getPollDurationSeconds } from '@/helpers/polls.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type {
    CompositePoll,
    CreatePollRequest,
    CreatePollResponse,
    GetPollResponse,
    Poll,
    VoteRequest,
    VoteResponse,
} from '@/providers/types/Poll.js';
import { settings } from '@/settings/index.js';

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
        urlcat(settings.FIREFLY_ROOT_URL, '/v1/vote_frame/poll/create'),
        {
            method: 'POST',
            body: JSON.stringify(request),
        },
    );

    if (!response.data?.poll_id) throw new Error('Failed to create poll');

    return response.data.poll_id;
};

export const getPoll = async (pollId: string, source: SocialSource): Promise<Poll | null> => {
    const profile = getCurrentProfile(source);
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/vote_frame/poll', {
        poll_id: pollId,
        platform: resolveSocialSourceInURL(source),
        platform_id: profile?.profileId,
    });

    const response = await fireflySessionHolder.fetch<GetPollResponse>(url);
    const fireflyPoll = resolveFireflyResponseData(response);

    return fireflyPoll ? formatFireflyPoll(fireflyPoll, source) : null;
};

export const vote = async (voteRequest: VoteRequest) => {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/vote_frame/poll/vote');
    const response = await fireflySessionHolder.fetch<VoteResponse>(url, {
        method: 'POST',
        body: JSON.stringify(voteRequest),
    });

    return resolveFireflyResponseData(response);
};
