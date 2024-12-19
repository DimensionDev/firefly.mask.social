'use client';

import { ActivityMobileOnly } from '@/components/Activity/ActivityMobileOnly.js';
import { ActivityElex24Tasks } from '@/components/Activity/ActivityTasks/ActivityElex24Tasks.js';
import { ActivityFrensgivingTasks } from '@/components/Activity/ActivityTasks/ActivityFrensgivingTasks.js';
import { ActivityHlblTasks } from '@/components/Activity/ActivityTasks/ActivityHlblTasks.js';
import { ActivityPenguTasks } from '@/components/Activity/ActivityTasks/ActivityPenguTasks.js';
import type { ActivityInfoResponse } from '@/providers/types/Firefly.js';

interface Props {
    name: string;
    data: Required<ActivityInfoResponse>['data'];
}

export function ActivityTasks({ name, data }: Props) {
    switch (name) {
        case 'hlbl':
            return <ActivityHlblTasks data={data} />;
        case 'elex24':
            return <ActivityElex24Tasks data={data} />;
        case 'frensgiving':
            return <ActivityFrensgivingTasks data={data} />;
        case 'pengu':
            return (
                <ActivityMobileOnly disabled>
                    <ActivityPenguTasks data={data} />
                </ActivityMobileOnly>
            );
        default:
            return null;
    }
}
