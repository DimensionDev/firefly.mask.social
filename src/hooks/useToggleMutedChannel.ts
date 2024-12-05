import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { captureMuteEvent } from '@/providers/telemetry/captureMuteEvent.js';
import type { Channel } from '@/providers/types/SocialMedia.js';
import { EventId } from '@/providers/types/Telemetry.js';

/**
 * Mute and unmute a channel
 */
export function useToggleMutedChannel() {
    return useAsyncFn(async (channel: Channel) => {
        try {
            const provider = resolveSocialMediaProvider(channel.source);
            if (channel.blocked) {
                const result = await provider.unblockChannel(channel.id);
                enqueueSuccessMessage(t`Unmute successfully.`);
                captureMuteEvent(EventId.UNMUTE_SUCCESS, channel);
                return result;
            } else {
                const result = await provider.blockChannel(channel.id);
                enqueueSuccessMessage(t`Mute successfully.`);
                captureMuteEvent(EventId.MUTE_SUCCESS, channel);
                return result;
            }
        } catch (error) {
            enqueueMessageFromError(
                error,
                channel.blocked ? t`Failed to unmute /${channel.name}.` : t`Failed to mute /${channel.name}.`,
            );
            throw error;
        }
    }, []);
}
