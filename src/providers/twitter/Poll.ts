import { Source } from '@/constants/enum.js';
import { getPollDurationSeconds } from '@/helpers/getPollDurationSeconds.js';
import type { CompositePoll, Poll, PollOption, Provider } from '@/providers/types/Poll.js';

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

    vote(pollId: string, option: PollOption): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getPollById(pollId: string): Promise<Poll> {
        throw new Error('Method not implemented.');
    }
}

export const TwitterPollProvider = new TwitterPoll();
