import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { SocialSource } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { type Channel, type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

const METHODS_BE_OVERRIDDEN = ['joinChannel', 'leaveChannel'] as const;

function setJoinStatus(source: SocialSource, channel: Channel, status: boolean) {
    const profile = getCurrentProfile(source);
    queryClient.setQueriesData<Channel>(
        {
            queryKey: ['channel', channel.source, channel.id, profile?.profileId],
        },
        (old) => {
            if (!old) return old;

            return produce(old, (draft) => {
                if (draft.id === channel.id && draft.source === channel.source) {
                    draft.isMember = status;
                }
                return draft;
            });
        },
    );
}

export function SetQueryDataForJoinChannel(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (channel: Channel) => {
                    const m = method as (channel: Channel) => Promise<boolean>;
                    const result = await m?.call(target.prototype, channel);
                    if (!result) return false;

                    setJoinStatus(source, channel, key === 'joinChannel');
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);
        return target;
    };
}
