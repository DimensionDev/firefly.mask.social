import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import ActiveIcon from '@/assets/snapshot-active.svg';
import ClosedIcon from '@/assets/snapshot-closed.svg';
import { classNames } from '@/helpers/classNames.js';
import { SnapshotState } from '@/providers/types/Snapshot.js';

interface Props {
    status: SnapshotState;
    className?: string;
}

export function SnapshotStatus({ status, className }: Props) {
    const isAcitveOrPending = status === SnapshotState.Active || status === SnapshotState.Pending;

    const title = useMemo(() => {
        switch (status) {
            case SnapshotState.Active:
                return t`Active`;
            case SnapshotState.Pending:
                return t`Pending`;
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
                    'bg-highlight': isAcitveOrPending,
                    'bg-secondary': status === SnapshotState.Closed,
                    'opacity-50': status === SnapshotState.Pending,
                },
                className,
            )}
        >
            {isAcitveOrPending ? <ActiveIcon /> : <ClosedIcon />}
            <span>{title}</span>
        </div>
    );
}
