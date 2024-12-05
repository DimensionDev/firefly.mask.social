import { t } from '@lingui/macro';
import { useIsMutating, useMutation } from '@tanstack/react-query';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getErrorMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export function useToggleJoinChannel(channel: Channel) {
    const { source } = channel;
    const profile = useCurrentProfile(source);
    const mutationKey = ['toggle-join-channel', source, channel.id, profile?.profileId];
    const isMutating = useIsMutating({ mutationKey, exact: true }) > 0;

    const mutation = useMutation({
        mutationKey,
        mutationFn: async () => {
            if (!profile?.profileId) {
                LoginModalRef.open({ source });
                return;
            }

            const joined = !!channel.isMember;
            const sourceName = resolveSourceName(channel.source);

            try {
                const provider = resolveSocialMediaProvider(source);
                const result = joined ? await provider.leaveChannel(channel) : await provider.joinChannel(channel);
                if (!result) {
                    throw new Error(`Failed to ${joined ? 'leave' : 'join'} channel`);
                }

                enqueueSuccessMessage(
                    joined ? t`Leave /${channel.id} on ${sourceName}.` : t`Join /${channel.id} on ${sourceName}.`,
                );
                return result;
            } catch (error) {
                enqueueErrorMessage(
                    getErrorMessageFromError(
                        error,
                        joined
                            ? t`Failed to leave /${channel.id} on ${sourceName}.`
                            : t`Failed to join /${channel.id} on ${sourceName}.`,
                    ),
                    { error },
                );
                throw error;
            }
        },
    });

    return [isMutating, mutation] as const;
}
