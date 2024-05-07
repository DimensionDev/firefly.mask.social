import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

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

                enqueueSuccessMessage(muted ? t`Unmute succcessfully.` : t`Mute successfully.`);
                return true;
            } catch (error) {
                enqueueErrorMessage(
                    muted ? t`Failed to unmute /${channel.name}.` : t`Failed to mute /${channel.name}.`,
                    {
                        error,
                    },
                );
                throw error;
            }
        },
        [operator, changeMuteStatus, allBlockedChannels],
    );
}
