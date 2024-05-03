import { FlagIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { useReportUser } from '@/hooks/useReportUser.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    profile: Profile;
    onConfirm?(): void;
}

export const ReportUserButton = forwardRef<HTMLButtonElement, Props>(function ReportUserButton(
    { profile, className, onConfirm, ...rest }: Props,
    ref,
) {
    const [_, reportUser] = useReportUser();
    return (
        <ClickableButton
            className={classNames('flex cursor-pointer items-center space-x-2 p-4 hover:bg-bg', className)}
            onClick={async () => {
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Report`,
                    content: (
                        <div className="text-main">
                            <Trans>Confirm you want to report this message</Trans>
                        </div>
                    ),
                });
                close();
                if (!confirmed) return;
                const result = await reportUser(profile);
                if (!result) {
                    enqueueErrorMessage(t`Failed to report @${profile.handle}`);
                }
            }}
            {...rest}
            ref={ref}
        >
            <FlagIcon width={24} height={24} />
            <span className="text-[17px] font-bold leading-[22px] text-main">
                <Trans>Report @{profile.handle}</Trans>
            </span>
        </ClickableButton>
    );
});
