import { Menu, type MenuProps } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { memo } from 'react';
import urlcat from 'urlcat';

import EllipsisHorizontalCircleIcon from '@/assets/ellipsis-horizontal-circle.svg';
import LoadingIcon from '@/assets/loading.svg';
import LinkIcon from '@/assets/small-link.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MuteChannelButton } from '@/components/Actions/MuteChannelButton.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { useCopyText } from '@/hooks/useCopyText.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useToggleMutedChannel } from '@/hooks/useToggleMutedChannel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface MoreProps extends Omit<MenuProps<'div'>, 'className'> {
    channel: Channel;
    className?: string;
}

export const ChannelMoreAction = memo<MoreProps>(function ChannelMoreAction({ channel }) {
    const isLogin = useIsLogin(channel.source);
    const [{ loading: channelBlocking }, toggleBlockChannel] = useToggleMutedChannel();

    const [, handleCopy] = useCopyText(urlcat(location.origin, getChannelUrl(channel)));

    return (
        <MoreActionMenu
            source={channel.source}
            button={
                channelBlocking ? (
                    <span className="inline-flex h-8 w-8 animate-spin items-center justify-center">
                        <LoadingIcon width={16} height={16} />
                    </span>
                ) : (
                    <EllipsisHorizontalCircleIcon className="h-8 w-8" />
                )
            }
        >
            <Menu.Items
                className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }}
            >
                <Menu.Item>
                    {({ close }) => (
                        <MenuButton
                            onClick={async () => {
                                close();
                                handleCopy();
                            }}
                        >
                            <LinkIcon width={18} height={18} />
                            <span className="font-bold leading-[22px] text-main">
                                <Trans>Copy link</Trans>
                            </span>
                        </MenuButton>
                    )}
                </Menu.Item>
                {isLogin ? (
                    <Menu.Item>
                        {({ close }) => (
                            <MuteChannelButton channel={channel} onToggle={toggleBlockChannel} onClick={close} />
                        )}
                    </Menu.Item>
                ) : null}
            </Menu.Items>
        </MoreActionMenu>
    );
});
