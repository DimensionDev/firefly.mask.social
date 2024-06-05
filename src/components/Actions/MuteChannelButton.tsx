import { SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    channel: Channel;
    onToggle?(channel: Channel): Promise<boolean>;
}

export const MuteChannelButton = forwardRef<HTMLButtonElement, Props>(function MuteChannelButton(
    { channel, onToggle, ...rest }: Props,
    ref,
) {
    const muted = channel.blocked;

    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                const confirmed = !muted
                    ? await ConfirmModalRef.openAndWaitForClose({
                          title: muted ? t`Unmute` : t`Mute`,
                          content: (
                              <div className="text-main">
                                  <Trans>Post from /{channel.id} will be hidden in your home timeline</Trans>
                              </div>
                          ),
                          variant: 'normal',
                      })
                    : true;

                if (!onToggle || !confirmed) return;
                const result = await onToggle(channel);
                if (result === false) {
                    enqueueErrorMessage(
                        muted ? t`Failed to unmute /${channel.id}.` : t`Failed to mute /${channel.id}.`,
                    );
                }
            }}
            ref={ref}
        >
            <SpeakerXMarkIcon width={24} height={24} />
            <span className="font-bold leading-[22px] text-main">
                {muted ? t`Unmute /${channel.id}` : t`Mute /${channel.id}`}
            </span>
        </MenuButton>
    );
});
