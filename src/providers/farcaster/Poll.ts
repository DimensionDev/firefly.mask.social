import { Source } from '@/constants/enum.js';
import { getPollDurationSeconds } from '@/helpers/getPollDurationSeconds.js';
import type { CompositePoll, Poll, PollOption, Provider } from '@/providers/types/Poll.js';
import { commitPoll } from '@/services/commitPoll.js';

class FarcasterPoll implements Provider {
    async createPoll(poll: CompositePoll, text?: string): Promise<Poll> {
        return await commitPoll(
            {
                id: '',
                options: poll.options,
                durationSeconds: getPollDurationSeconds(poll.duration),
                source: Source.Farcaster,
                type: poll.type,
                strategies: poll.strategies,
                multiple_count: poll.multiple_count,
            },
            text ?? '',
        );
    }

    vote(pollId: string, option: PollOption): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getPollById(pollId: string): Promise<Poll> {
        throw new Error('Method not implemented.');
    }
}

export const FarcasterPollProvider = new FarcasterPoll();
