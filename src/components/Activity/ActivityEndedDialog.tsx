'use client';

import { Trans } from '@lingui/macro';
import { useRouter } from 'next/navigation.js';
import { useCallback, useEffect } from 'react';

import { Modal } from '@/components/Modal.js';
import { PageRoute } from '@/constants/enum.js';
import { type ActivityInfoResponse, ActivityStatus } from '@/providers/types/Firefly.js';

interface Props {
    data: Pick<Required<ActivityInfoResponse>['data'], 'status'>;
}

export function ActivityEndedDialog({ data }: Props) {
    const router = useRouter();
    const open = data.status === ActivityStatus.Ended;
    const onClose = useCallback(() => {
        router.replace(PageRoute.Events);
    }, [router]);
    useEffect(() => {
        const timeoutId = setTimeout(onClose, 3000);
        return () => clearTimeout(timeoutId);
    }, [onClose]);

    return (
        <Modal open={open} onClose={onClose}>
            <div className="w-[359px] transform rounded-[12px] bg-primaryBottom transition-all">
                <div className="relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-t-[12px] pt-6 text-center">
                    <div className="text-lg font-bold leading-6 text-main">
                        <Trans>Event Ended!</Trans>
                    </div>
                </div>
                <div className="p-6">
                    <p className="mb-6 text-sm font-medium leading-6 text-second">
                        <Trans>The event has ended, but you can explore others in Exclusive Events.</Trans>
                    </p>
                    <button
                        className="flex h-12 w-full items-center justify-center rounded-full border border-current px-4 text-center text-base font-bold leading-8"
                        onClick={onClose}
                    >
                        <Trans>Redirecting...</Trans>
                    </button>
                </div>
            </div>
        </Modal>
    );
}
