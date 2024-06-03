'use client';

import { t, Trans } from '@lingui/macro';

import ReportSpamIcon from '@/assets/report-spam.svg';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { reportNFT } from '@/services/reportNFT.js';

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
                            <Trans>Are you sure you want to report this collection?</Trans>
                        </div>
                    ),
                });
                if (!confirmed) return;
                try {
                    await reportNFT(collectionId);
                } catch (error) {
                    enqueueErrorMessage(getSnackbarMessageFromError(error, t`Report Failed`), {
                        error,
                    });
                    throw error;
                }
            }}
        >
            <ReportSpamIcon className="h-3 w-3" />
            <Trans>Report spam</Trans>
        </button>
    );
}
