'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ActivityElex24Provider } from '@/components/Activity/ActivityElex24/ActivityElex24Context.js';
import { ActivityEndedDialog } from '@/components/Activity/ActivityEndedDialog.js';
import { ActivityHeader } from '@/components/Activity/ActivityHeader.js';
import { ActivityNavigationBar } from '@/components/Activity/ActivityNavigationBar.js';
import { ActivityTasks } from '@/components/Activity/ActivityTasks/index.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';
import { ActivityStatus } from '@/providers/types/Firefly.js';

export default function Page({
    params: { name },
}: {
    params: {
        name: string;
    };
}) {
    const { data } = useSuspenseQuery({
        queryKey: ['activity-info', name],
        async queryFn() {
            return FireflyActivityProvider.getFireflyActivityInfo(name);
        },
    });

    if (!data) notFound();

    return (
        <ActivityElex24Provider>
            <div className="flex min-h-[100svh] w-full flex-1 flex-col">
                <ActivityNavigationBar>{data.title}</ActivityNavigationBar>
                <ActivityHeader data={data} />
                <ActivityTasks data={data} name={name} />
                {data.status === ActivityStatus.Ended ? <ActivityEndedDialog data={data} /> : null}
            </div>
        </ActivityElex24Provider>
    );
}
