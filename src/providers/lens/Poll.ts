import { Source } from '@/constants/enum.js';
import { getPollDurationSeconds } from '@/helpers/getPollDurationSeconds.js';
import type { CompositePoll, Poll, PollOption, Provider } from '@/providers/types/Poll.js';
import { commitPoll } from '@/services/commitPoll.js';

class LensPoll implements Provider {
    async createPoll(poll: CompositePoll, text = ''): Promise<Poll> {
        return {
            id: poll.id || (await commitPoll(poll, text)),
            options: poll.options,
            durationSeconds: getPollDurationSeconds(poll.duration),
            source: Source.Lens,
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

export const LensPollProvider = new LensPoll();
