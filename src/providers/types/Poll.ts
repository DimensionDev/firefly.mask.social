import type { Pageable } from '@masknet/shared-base';

import type { SocialSource } from '@/constants/enum.js';
import type { POLL_CHOICE_TYPE, POLL_STRATEGIES } from '@/constants/poll.js';
import type { Response } from '@/providers/types/Firefly.js';

export interface PollOption {
    id: string;
    position?: number;
    label: string;
    votes?: number;
}

export interface Poll {
    id: string;
    options: PollOption[];
    source: SocialSource;
    durationSeconds: number;
    endDatetime?: string;
    votingStatus?: string;
    type: POLL_CHOICE_TYPE;
    multiple_count?: string;
    strategies: POLL_STRATEGIES;
}

export interface CompositePoll {
    id?: string;
    options: PollOption[];
    duration: {
        days: number;
        hours: number;
        minutes: number;
    };
    type: POLL_CHOICE_TYPE;
    multiple_count?: string;
    strategies: POLL_STRATEGIES;
}

export interface CreatePollRequest {
    title: string;
    choices: string[];
    type: POLL_CHOICE_TYPE;
    multiple_count?: string;
    sub_time: number;
    strategies: POLL_STRATEGIES;
}

export type CreatePollResponse = Response<{
    poll_id: string;
}>;

export interface Provider {
    /**
     * Creates a new poll
     * @param poll
     * @param text Optional text to associate with the poll
     * @returns
     */
    createPoll: (poll: CompositePoll, text?: string) => Promise<Poll>;

    /**
     * Retrieves a poll by its id
     * @param pollId
     * @returns
     */
    getPollById: (pollId: string) => Promise<Poll>;

    /**
     * Votes for an option in a poll
     * @param pollId
     * @param option
     * @returns
     */
    vote: (pollId: string, option: PollOption) => Promise<void>;

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
