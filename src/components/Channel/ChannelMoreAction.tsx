'use client';

import { MenuItem, type MenuProps } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import MoreCircleIcon from '@/assets/more-circle.svg';
import { CopyLinkButton } from '@/components/Actions/CopyLinkButton.js';
import { MuteChannelButton } from '@/components/Actions/MuteChannelButton.js';
import { ToggleJoinChannel } from '@/components/Actions/ToggleJoinChannel.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Source } from '@/constants/enum.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useToggleMutedChannel } from '@/hooks/useToggleMutedChannel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface MoreProps extends Omit<MenuProps<'div'>, 'className'> {
    channel: Channel;
    className?: string;
}

export const ChannelMoreAction = memo<MoreProps>(function ChannelMoreAction({ channel }) {
    const profile = useCurrentProfile(channel.source);
    const [{ loading: channelBlocking }, toggleBlockChannel] = useToggleMutedChannel();

    const { data } = useQuery({
        queryKey: ['channel', channel.source, channel.id, profile?.profileId],
        queryFn: () => runInSafeAsync(() => resolveSocialMediaProvider(channel.source).getChannelById(channel.id)),
    });

    return (
        <MoreActionMenu
            source={channel.source}
            button={
                channelBlocking ? (
                    <span className="inline-flex h-8 w-8 animate-spin items-center justify-center">
                        <LoadingIcon width={16} height={16} />
                    </span>
                ) : (
                    <MoreCircleIcon width={32} height={32} />
                )
            }
        >
            <MenuGroup>
                <MenuItem>{({ close }) => <CopyLinkButton link={getChannelUrl(channel)} onClick={close} />}</MenuItem>
                {profile?.profileId ? (
                    <>
                        {channel.source === Source.Farcaster ? (
                            <MenuItem>
                                {({ close }) => (
                                    <MuteChannelButton
                                        channel={channel}
                                        onToggle={toggleBlockChannel}
                                        onClick={close}
                                    />
                                )}
                            </MenuItem>
                        ) : null}
                        {channel.source === Source.Lens && data?.canJoin ? (
                            <MenuItem>{({ close }) => <ToggleJoinChannel channel={data} onClick={close} />}</MenuItem>
                        ) : null}
                    </>
                ) : null}
            </MenuGroup>
        </MoreActionMenu>
    );
});
