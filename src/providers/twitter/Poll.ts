import type { Poll, PollOption, Provider } from '@/providers/types/Poll.js';

class TwitterPoll implements Provider {
    async createPoll(poll: Poll): Promise<Poll> {
        return {
            id: '',
            options: poll.options.map((option) => ({ id: option.id, label: option.label })),
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

export const TwitterPollProvider = new TwitterPoll();
