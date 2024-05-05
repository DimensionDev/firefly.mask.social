import { EyeSlashIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
    onConfirm?(): void;
    onBlock?(profile: Profile): Promise<boolean>;
}

export const BlockUserButton = forwardRef<HTMLButtonElement, Props>(function BlockUserButton(
    { profile, className, onConfirm, onBlock, ...rest }: Props,
    ref,
) {
    return (
        <ClickableButton
            className={classNames('flex cursor-pointer items-center space-x-2 p-4 hover:bg-bg', className)}
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Block`,
                    content: (
                        <div className="text-main">
                            <Trans>Confirm you want to block @{profile.handle}</Trans>
                        </div>
                    ),
                });
                if (!confirmed) return;
                onConfirm?.();
                if (!onBlock) return;
                const result = await onBlock(profile);
                if (result === false) {
                    enqueueErrorMessage(t`Failed to block @${profile.handle}`);
                }
            }}
            ref={ref}
        >
            <EyeSlashIcon width={24} height={24} />
            <span className="text-[17px] font-bold leading-[22px] text-main">
                <Trans>Block @{profile.handle}</Trans>
            </span>
        </ClickableButton>
    );
});
