import type { SocialSource, SocialSourceInURL } from '@/constants/enum.js';
import type { POLL_CHOICE_TYPE, POLL_STRATEGIES } from '@/constants/poll.js';
import type { Pageable } from '@/helpers/pageable.js';
import type { Response } from '@/providers/types/Firefly.js';

export interface PollOption {
    id: string;
    position?: number;
    label: string;
    votes?: number;
    isVoted?: boolean;
    percent?: number;
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

type FireflyPollOption = {
    id: number;
    name: string;
    count: number;
    is_select: boolean;
    percent: number;
};

export interface FireflyPoll {
    poll_id: string;
    created_time: number;
    end_time: number;
    is_end: boolean;
    vote_count: number;
    type: POLL_CHOICE_TYPE;
    multiple_count: number;
    choice_detail: FireflyPollOption[];
}

export type GetPollResponse = Response<FireflyPoll>;

export interface VoteRequest {
    poll_id: string;
    platform: SocialSourceInURL;
    platform_id: string;
    choices: number[];
    lens_token: string;
    farcaster_signature: string;
    wallet_address: string;
    original_message: string;
    signature_message: string;
}

export type VoteResponseData = {
    is_success: boolean;
    choice_detail: FireflyPollOption[];
};

export type VoteResponse = Response<VoteResponseData>;

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
     * @param postId
     * @param pollId
     * @param frameUrl
     * @param option
     * @returns
     */
    vote: (options: {
        postId: string;
        pollId: string;
        frameUrl: string;
        option: PollOption;
    }) => Promise<VoteResponseData>;

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
