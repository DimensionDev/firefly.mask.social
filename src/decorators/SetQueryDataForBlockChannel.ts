import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { SearchType, type SocialSource } from '@/constants/enum.js';
import { type Matcher, patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { type Channel, type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function setBlockStatus(source: SocialSource, channelId: string, status: boolean) {
    const matcher: Matcher = (post) => post?.channel?.id === channelId;

    patchPostQueryData(source, matcher, (draft) => {
        if (draft.channel?.id !== channelId) return;

        draft.channel.blocked = status;
    });

    const updater = (old: Channel | undefined) => {
        if (!old || old.id !== channelId) return old;

        return produce(old, (draft) => {
            draft.blocked = status;
        });
    };

    queryClient.setQueriesData<Channel>({ queryKey: ['channels'] }, updater);
    queryClient.setQueriesData<Channel>({ queryKey: ['search', SearchType.Channels] }, updater);
    queryClient.setQueryData<Channel>(['channel', source, channelId], updater);
    queryClient.setQueryData<Channel>(['suggest-channels', source], updater);
}

const METHODS_BE_OVERRIDDEN = ['blockChannel', 'unblockChannel'] as const;

export function SetQueryDataForBlockChannel(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (channelId: string) => {
                    const m = method as (channelId: string) => Promise<boolean>;
                    const result = await m?.call(target.prototype, channelId);
                    if (!result) return false;

                    setBlockStatus(source, channelId, key === 'blockChannel');
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);
        return target;
    };
}
