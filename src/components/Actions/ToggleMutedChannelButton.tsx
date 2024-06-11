import { t, Trans } from '@lingui/macro';
import { produce } from 'immer';
import { memo } from 'react';

import { ToggleMutedButton } from '@/components/Actions/ToggleMutedButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { queryClient } from '@/configs/queryClient.js';
import { isSameChannel } from '@/helpers/isSameChannel.js';
import { useToggleMutedChannel } from '@/hooks/useToggleMutedChannel.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    channel: Channel;
}

const setQueryDataForChannel = (channel: Channel, isMuted: boolean) => {
    queryClient.setQueriesData<{ pages: Array<{ data: Channel[] }> }>(
        { queryKey: ['channels', channel.source, 'muted-list'] },
        (oldData) => {
            if (!oldData) return oldData;
            return produce(oldData, (draft) => {
                for (const page of draft.pages) {
                    if (!page) continue;
                    for (const mutedChannel of page.data) {
                        if (!isSameChannel(mutedChannel, channel)) continue;
                        mutedChannel.blocked = isMuted;
                    }
                }
            });
        },
    );
};

export const ToggleMutedChannelButton = memo(function ToggleMutedChannelButton({ channel, ...rest }: Props) {
    const isMuted = channel.blocked ?? true;

    const [{ loading }, toggleMutedChannel] = useToggleMutedChannel();

    const onToggle = async () => {
        const confirmed = await ConfirmModalRef.openAndWaitForClose({
            title: t`${isMuted ? 'Unmute' : 'Mute'} /${channel.name}`,
            content: (
                <div className="text-main">
                    <Trans>
                        Confirm you want to {isMuted ? 'unmute' : 'mute'} /{channel.name}?
                    </Trans>
                </div>
            ),
        });
        if (!confirmed) return;
        const result = await toggleMutedChannel({ ...channel, blocked: isMuted });
        if (result) {
            setQueryDataForChannel(channel, !isMuted);
        }
    };

    return <ToggleMutedButton {...rest} isMuted={isMuted} loading={loading} onClick={onToggle} />;
});
