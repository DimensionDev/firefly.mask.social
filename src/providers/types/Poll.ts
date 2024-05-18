import type { Pageable } from '@masknet/shared-base';

export interface Poll {
    pollId: string;
    startAt: string;
    expiredAt: string;
    validInDays: number;
    options: string[];
}

export interface PollPureOption {
    id: string;
    text: string;
}

export type PurePoll = Pick<Poll, 'validInDays'> & { options: PollPureOption[] }

export interface Provider {
    /**
     * Creates a new poll
     * @param poll
     * @returns
     */
    createPoll: (poll: Poll) => Promise<void>;

    /**
     * Retrieves a poll by its id
     * @param pollId
     * @returns
     */
    getPollById: (pollId: string) => Promise<Poll>;

    /**
     * Deletes a poll by its id
     */
    deletePoll?: (pollId: string) => Promise<void>;

    /**
     * Retrieves all polls
     * @returns
     */
    getPollsByProfileId?: (profileId: string) => Promise<Pageable<Poll>>;
}
