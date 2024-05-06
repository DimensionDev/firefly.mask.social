import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { queryClient } from '@/configs/queryClient.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import type { Channel, Profile } from '@/providers/types/SocialMedia.js';
import { useBlockedChannelState } from '@/store/useBlockedChannelStore.js';

export function useChangeChannelStatus(operator: Profile | null) {
    const { changeMuteStatus, allBlockedChannels } = useBlockedChannelState();

    return useAsyncFn(
        async (channel: Channel) => {
            if (!operator) return false;
            const key = `${operator.source}:${operator.profileId}`;
            const muted = allBlockedChannels[key]?.includes(channel.id);

            try {
                changeMuteStatus(operator, channel);
                await queryClient.invalidateQueries({
                    queryKey: ['posts', channel.source],
                });
                await queryClient.refetchQueries({
                    queryKey: ['posts', channel.source],
                    stale: true,
                    type: 'active',
                });
                enqueueSuccessMessage(t`${muted ? t`Unmute` : t`Mute`} /${channel.name} successfully`);
                return true;
            } catch (error) {
                enqueueErrorMessage(t`Failed to ${muted ? t`unmute` : t`mute`} /${channel.name}`, { error });
                throw error;
            }
        },
        [operator, changeMuteStatus, allBlockedChannels],
    );
}
