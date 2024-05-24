'use client';

import { t, Trans } from '@lingui/macro';

import ReportSpamIcon from '@/assets/report-spam.svg';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function ReportSpamButton(props: { collectionId: string }) {
    const { collectionId } = props;
    return (
        <button
            className="flex cursor-pointer select-none items-center gap-1 rounded-full border border-line bg-lightBg px-2 py-1 text-[10px] leading-[14px]"
            onClick={async () => {
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Report Spam`,
                    variant: 'normal',
                    content: (
                        <div className="text-main">
                            <Trans>Confirm to report this Collection?</Trans>
                        </div>
                    ),
                });
                if (!confirmed) return;
                try {
                    await FireflySocialMediaProvider.reportSpamNFT(collectionId);
                } catch (error) {
                    enqueueErrorMessage(getSnackbarMessageFromError(error, t`Report Failed`), {
                        error,
                    });
                }
            }}
        >
            <ReportSpamIcon className="h-3 w-3" />
            <Trans>Report spam</Trans>
        </button>
    );
}
