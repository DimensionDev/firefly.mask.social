'use client';

import { Trans } from '@lingui/macro';
import type { PropsWithChildren } from 'react';

import VoteIcon from '@/assets/vote.svg';
import { ActivityCellAction } from '@/components/ActivityCell/ActivityCellAction.js';
import { ActivityCellActionTag } from '@/components/ActivityCell/ActivityCellActionTag.js';

export function ActivityCellSnapshotAction({ children }: PropsWithChildren) {
    return (
        <ActivityCellAction>
            <ActivityCellActionTag icon={<VoteIcon />}>
                <Trans>Voted</Trans>
            </ActivityCellActionTag>
            {children}
        </ActivityCellAction>
    );
}
