import { Source } from '@/constants/enum.js';
import type { CompositePoll, Poll, PollOption, Provider } from '@/providers/types/Poll.js';
import { commitPoll } from '@/services/commitPoll.js';

class LensPoll implements Provider {
    async createPoll(poll: CompositePoll, text?: string): Promise<Poll> {
        return await commitPoll(
            {
                id: '',
                options: poll.options,
                validInDays: poll.validInDays,
                source: Source.Lens,
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

export const LensPollProvider = new LensPoll();
