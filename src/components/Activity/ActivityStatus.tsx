'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';

import { ActivityStatus } from '@/providers/types/Firefly.js';

export function ActivityStatusTag({ status }: { status: ActivityStatus }) {
    switch (status) {
        case ActivityStatus.Ended:
            return (
                <div className="rounded-full border border-current bg-primaryBottom/80 px-2.5 text-center text-xs font-bold uppercase leading-6 text-second">
                    <Trans>Ended</Trans>
                </div>
            );
        case ActivityStatus.Active:
            return (
                <div className="flex items-center rounded-full border border-current bg-primaryBottom/80 px-2.5 text-center text-xs font-bold uppercase leading-6 text-success">
                    <Trans>Active</Trans>
                    <div className="ml-1 h-2 w-2 shrink-0 rounded-full bg-current" />
                </div>
            );
        case ActivityStatus.Upcoming:
            return (
                <div className="rounded-full border border-current bg-primaryBottom/80 px-2.5 text-center text-xs font-bold uppercase leading-6 text-main">
                    <Trans>Upcoming</Trans>
                </div>
            );
        default:
            safeUnreachable(status);
            return null;
    }
}
