'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { ProjectItem } from '@/components/ProjectItem.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { useLocale } from '@/store/useLocale.js';

export function ProjectTrendingList() {
    const locale = useLocale();
    const { data, isFetching } = useSuspenseQuery({
        queryKey: ['explore-projects', locale],
        queryFn: async () => {
            return FireflyEndpointProvider.getTopProjects(locale);
        },
    });

    if (!data.length && isFetching) {
        return <NoResultsFallback />;
    }

    return (
        <div>
            {data.map((x) => {
                return <ProjectItem key={x.project_id} project={x} />;
            })}
        </div>
    );
}
