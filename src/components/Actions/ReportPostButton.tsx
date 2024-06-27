import { t, Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import FlagIcon from '@/assets/flag.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    post: Post;
    onReport?(post: Post): Promise<boolean>;
}

export const ReportPostButton = forwardRef<HTMLButtonElement, Props>(function ReportPostButton(
    { post, onReport, ...rest }: Props,
    ref,
) {
    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Report post`,
                    content: (
                        <div className="text-main">
                            <Trans>Are you sure you want to report this post?</Trans>
                        </div>
                    ),
                    variant: 'normal',
                });
                if (!confirmed || !onReport) return;
                const result = await onReport(post);
                if (result === false) {
                    enqueueErrorMessage(t`Failed to submit report on ${post.source}`);
                }
            }}
            ref={ref}
        >
            <FlagIcon width={18} height={18} />
            <span className="font-bold leading-[22px] text-main">
                <Trans>Report post</Trans>
            </span>
        </MenuButton>
    );
});
