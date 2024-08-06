import { t, Trans } from '@lingui/macro';
import { useState } from 'react';

import { WalletItem } from '@/app/(settings)/components/WalletItem.js';
import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import type { FireflyWalletConnection, WalletConnection } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

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

export async function waitForDisconnectConfirmation(connection: FireflyWalletConnection, relatedProfiles: Profile[]) {
    return await ConfirmModalRef.openAndWaitForClose({
        title: t`Disconnect`,
        content: (
            <div className="-mt-4 mb-1">
                <p className="mb-3 text-[13px] text-lightMain">
                    {relatedProfiles.length ? (
                        <Trans>
                            Confirm to disconnect this wallet and related accounts from Firefly’s social graph?
                        </Trans>
                    ) : (
                        <Trans>Confirm to disconnect this wallet from Firefly’s social graph?</Trans>
                    )}
                </p>
                <WalletItem connection={connection} noAction />
                <div className="no-scrollbar max-h-[calc(63px_*_3)] overflow-y-auto">
                    {relatedProfiles.map((profile) => (
                        <div
                            key={profile.profileId}
                            className="mb-3 inline-flex h-[63px] w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 dark:bg-bg"
                            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
                        >
                            <ProfileAvatar profile={profile} size={36} />
                            <ProfileName profile={profile} />
                        </div>
                    ))}
                </div>
            </div>
        ),
    });
}
