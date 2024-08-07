import { t, Trans } from '@lingui/macro';
import { useState } from 'react';

import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ConfirmModalRef } from '@/modals/controls.js';

const getReasons = () => [t`Not my wallet address.`, t`I don’t use anymore.`, t`I want to hide this wallet address.`];

interface ReportReasonProps {
    onSelected(reason: string): void;
}

function ReportReason({ onSelected }: ReportReasonProps) {
    const reasons = getReasons();
    const [selectedReason, setReason] = useState(reasons[0]);

    return (
        <div className="-mt-4 mb-1 flex w-full flex-col gap-y-3 text-left">
            <p className="mb-[5px] text-[13px] text-lightMain">
                <Trans>Please choose issue to report this wallet:</Trans>
            </p>
            {reasons.map((reason) => (
                <div
                    key={reason}
                    className="flex w-full cursor-pointer items-center rounded-lg bg-white bg-bottom py-2 pl-3 text-[15px] text-lightMain dark:bg-bg"
                    style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
                    onClick={() => {
                        setReason(reason);
                        onSelected(reason);
                    }}
                >
                    <p className="w-full font-medium">{reason}</p>
                    <CircleCheckboxIcon className="shrink-0" checked={selectedReason === reason} />
                </div>
            ))}
        </div>
    );
}

export async function waitForSelectReportReason() {
    let selectedReason = getReasons()[0];
    const confirmed = await ConfirmModalRef.openAndWaitForClose({
        title: t`Report`,
        variant: 'normal',
        confirmButtonText: t`Send`,
        content: (
            <ReportReason
                onSelected={(reason) => {
                    selectedReason = reason;
                }}
            />
        ),
    });

    return confirmed ? selectedReason : null;
}
