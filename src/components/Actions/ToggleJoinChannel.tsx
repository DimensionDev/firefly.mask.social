import { t } from '@lingui/macro';
import { forwardRef } from 'react';

import FollowUserIcon from '@/assets/follow-user.svg';
import LoadingIcon from '@/assets/loading.svg';
import UnFollowUserIcon from '@/assets/unfollow-user.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import type { ClickableButtonProps } from '@/components/ClickableButton.js';
import { useToggleJoinChannel } from '@/hooks/useToggleJoinChannel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    channel: Channel;
    onClick?: () => void;
}

export const ToggleJoinChannel = forwardRef<HTMLButtonElement, Props>(function ToggleJoinChannel(
    { channel, onClick, ...rest }: Props,
    ref,
) {
    const joined = !!channel.isMember;
    const Icon = joined ? UnFollowUserIcon : FollowUserIcon;
    const [isMutating, mutation] = useToggleJoinChannel(channel);

    return (
        <MenuButton
            {...rest}
            disabled={isMutating}
            onClick={async () => {
                await mutation.mutateAsync();
                onClick?.();
            }}
            ref={ref}
        >
            {isMutating ? (
                <LoadingIcon className="animate-spin" width={18} height={18} />
            ) : (
                <Icon width={18} height={18} />
            )}
            <span className="font-bold leading-[22px] text-main">
                {joined ? t`Leave /${channel.id}` : t`Join /${channel.id}`}
            </span>
        </MenuButton>
    );
});
