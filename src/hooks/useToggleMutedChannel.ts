import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { captureMuteEvent } from '@/providers/telemetry/captureMuteEvent.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

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
                captureMuteEvent('unmute', channel);
                return result;
            } else {
                const result = await provider.blockChannel(channel.id);
                enqueueSuccessMessage(t`Mute successfully.`);
                captureMuteEvent('mute', channel);
                return result;
            }
        } catch (error) {
            enqueueErrorMessage(
                getSnackbarMessageFromError(
                    error,
                    channel.blocked ? t`Failed to unmute /${channel.name}.` : t`Failed to mute /${channel.name}.`,
                ),
                { error },
            );
            throw error;
        }
    }, []);
}
