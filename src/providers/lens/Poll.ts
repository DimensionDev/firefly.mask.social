import { SourceInURL } from '@/constants/enum.js';
import type { Poll, PollOption, Provider } from '@/providers/types/Poll.js';
import { createPoll } from '@/services/createPoll.js';

class LensPoll implements Provider {
    async createPoll(poll: Poll, text?: string): Promise<Poll> {
        const newPollId = await createPoll(poll, text ?? '', SourceInURL.Lens);
        return {
            id: newPollId,
            options: poll.options,
            validInDays: poll.validInDays,
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
