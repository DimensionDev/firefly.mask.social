import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { SocialSource } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import type { Poll, PollOption, Provider, VoteResponseData } from '@/providers/types/Poll.js';
import type { ClassType } from '@/types/index.js';

const METHODS_BE_OVERRIDDEN = ['vote'] as const;

function updatePollFromQueryData(data: VoteResponseData, source: SocialSource, pollId: string) {
    if (!data?.is_success) return;
    const profile = getCurrentProfile(source);
    queryClient.setQueriesData<Poll>(
        {
            queryKey: ['poll', source, pollId, profile?.profileId],
        },
        (old) => {
            if (!old) return old;
            return produce(old, (draft) => {
                draft.options = data.choice_detail.map((choice) => ({
                    id: `${choice.id}`,
                    position: choice.id,
                    label: choice.name,
                    votes: choice.count,
                    isVoted: choice.is_select,
                    percent: choice.percent,
                }));
            });
        },
    );
}

export function SetQueryDataForVote(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (options: { postId: string; pollId: string; frameUrl: string; option: PollOption }) => {
                    const m = method as (options: {
                        postId: string;
                        pollId: string;
                        frameUrl: string;
                        option: PollOption;
                    }) => ReturnType<Provider[K]>;
                    const result = await m.call(target.prototype, options);
                    updatePollFromQueryData(result, source, options.pollId);
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

        return target;
    };
}
