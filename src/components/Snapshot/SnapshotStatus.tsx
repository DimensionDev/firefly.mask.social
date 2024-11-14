import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import ActiveIcon from '@/assets/snapshot-active.svg';
import ClosedIcon from '@/assets/snapshot-closed.svg';
import RejectedIcon from '@/assets/snapshot-rejected.svg';
import { SnapshotState } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';

interface Props {
    status: SnapshotState;
    className?: string;
}

export function SnapshotStatus({ status, className }: Props) {
    const isActiveOrPending = status === SnapshotState.Active || status === SnapshotState.Pending;

    const title = useMemo(() => {
        switch (status) {
            case SnapshotState.Active:
                return t`Active`;
            case SnapshotState.Pending:
                return t`Pending`;
            case SnapshotState.Passed:
                return t`Passed`;
            case SnapshotState.Rejected:
                return t`Rejected`;
            case SnapshotState.Executed:
                return t`Executed`;
            case SnapshotState.Closed:
                return t`Closed`;
            default:
                safeUnreachable(status);
                return '';
        }
    }, [status]);
    return (
        <div
            className={classNames(
                'flex items-center gap-1 rounded-full px-3 py-[2px] text-sm leading-[18px] text-white',
                {
                    'bg-highlight': isActiveOrPending,
                    'bg-secondary': status === SnapshotState.Passed,
                    'bg-danger bg-opacity-50': status === SnapshotState.Rejected,
                    'opacity-50': status === SnapshotState.Pending,
                },
                className,
            )}
        >
            {isActiveOrPending ? <ActiveIcon /> : status === SnapshotState.Rejected ? <RejectedIcon /> : <ClosedIcon />}
            <span>{title}</span>
        </div>
    );
}
