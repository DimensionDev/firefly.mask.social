import type { Poll, PollOption, Provider } from '@/providers/types/Poll.js';

class LensPoll implements Provider {
    createPoll(poll: Poll): Promise<Poll> {
        throw new Error('Method not implemented.');
    }

    vote(pollId: string, option: PollOption): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getPollById(pollId: string): Promise<Poll> {
        throw new Error('Method not implemented.');
    }
}

export const LensPollProvider = new LensPoll();
