import { FlagIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    busy?: boolean;
    profile: Profile;
    onConfirm?(): void;
    onReport?(profile: Profile): Promise<boolean>;
}

export const ReportUserButton = forwardRef<HTMLButtonElement, Props>(function ReportUserButton(
    { busy, profile, className, onConfirm, onReport, ...rest }: Props,
    ref,
) {
    return (
        <ClickableButton
            className={classNames('flex cursor-pointer items-center p-4 hover:bg-bg', className)}
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Report`,
                    content: (
                        <div className="text-main">
                            <Trans>Confirm you want to report @{profile.handle}?</Trans>
                        </div>
                    ),
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
            {busy ? (
                <LoadingIcon width={24} height={24} className="animate-spin text-danger" />
            ) : (
                <FlagIcon width={24} height={24} />
            )}
            <span className="text-[17px] font-bold leading-[22px] text-main">
                <Trans>Report @{profile.handle}</Trans>
            </span>
        </ClickableButton>
    );
});
