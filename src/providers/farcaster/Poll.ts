import type { Poll, PollOption, Provider } from '@/providers/types/Poll.js';
import { createFarcasterPoll } from '@/services/createFarcasterPoll.js';

class FarcasterPoll implements Provider {
    async createPoll(poll: Poll, text?: string): Promise<Poll> {
        const newPollId = await createFarcasterPoll(poll, text ?? '');
        return {
            id: newPollId,
            options: poll.options,
            validInDays: poll.validInDays,
        }
    }

    vote(pollId: string, option: PollOption): Promise<void> {
        throw new Error('Method not implemented.');
    };

    getPollById(pollId: string): Promise<Poll> {
        throw new Error('Method not implemented.');
    }
}

export const FarcasterPollProvider = new FarcasterPoll();
