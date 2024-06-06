'use client';

import { Trans } from '@lingui/macro';

import ReportSpamIcon from '@/assets/report-spam.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { useReportSpamNFT } from '@/hooks/useReportSpamNFT.js';

export function ReportSpamButton(props: { collectionId: string }) {
    const { collectionId } = props;
    const [, reportSpamNFT] = useReportSpamNFT();
    return (
        <ClickableButton
            className="flex cursor-pointer select-none items-center gap-1 rounded-full border border-line bg-lightBg px-2 py-1 text-[10px] leading-[14px]"
            onClick={() => reportSpamNFT(collectionId)}
        >
            <ReportSpamIcon className="h-3 w-3" />
            <Trans>Report spam</Trans>
        </ClickableButton>
    );
}
