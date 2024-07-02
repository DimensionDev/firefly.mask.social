import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import FlagIcon from '@/assets/flag.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
    onConfirm?(): void;
    onReport?(profile: Profile): Promise<boolean>;
}

export const ReportProfileButton = forwardRef<HTMLButtonElement, Props>(function ReportProfileButton(
    { profile, onConfirm, onReport, ...rest }: Props,
    ref,
) {
    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Report @${profile.handle}`,
                    content: (
                        <div className="text-main">
                            <Trans>Are you sure you want to report this user?</Trans>
                        </div>
                    ),
                    variant: 'normal',
                });
                if (!confirmed) return;
                onConfirm?.();
                if (!onReport) return;
                const result = await onReport(profile);
                if (result === false) {
                    enqueueErrorMessage(t`Failed to report @${profile.handle}`);
                }
            }}
            ref={ref}
        >
            <FlagIcon width={18} height={18} />
            <span className="font-bold leading-[22px] text-main">
                <Trans>Report @{profile.handle}</Trans>
            </span>
        </MenuButton>
    );
});
