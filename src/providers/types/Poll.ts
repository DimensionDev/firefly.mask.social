import type { Pageable } from '@masknet/shared-base';

export interface Poll {
    id?: string;
    options: Array<{
        id?: string;
        position?: number;
        label: string;
        votes?: number;
    }>;
    validInDays: number;
    endDatetime?: string;
    votingStatus?: string;
}

export type PollPureOption = Poll['options'][number];

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
