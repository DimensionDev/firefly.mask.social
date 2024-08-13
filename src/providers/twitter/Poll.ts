import { Source } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';
import { SetQueryDataForVote } from '@/decorators/SetQueryDataForVote.js';
import { getPollDurationSeconds } from '@/helpers/polls.js';
import type { CompositePoll, Poll, PollOption, Provider, VoteResponseData } from '@/providers/types/Poll.js';

@SetQueryDataForVote(Source.Twitter)
class TwitterPoll implements Provider {
    async createPoll(poll: CompositePoll): Promise<Poll> {
        return {
            id: '',
            options: poll.options.map((option) => ({ id: option.id, label: option.label })),
            durationSeconds: getPollDurationSeconds(poll.duration),
            source: Source.Twitter,
            type: poll.type,
            strategies: poll.strategies,
            multiple_count: poll.multiple_count,
        };
    }

    vote(options: { postId: string; pollId: string; frameUrl: string; option: PollOption }): Promise<VoteResponseData> {
        throw new NotImplementedError();
    }

    getPollById(pollId: string): Promise<Poll> {
        throw new NotImplementedError();
    }
}

export const TwitterPollProvider = new TwitterPoll();
