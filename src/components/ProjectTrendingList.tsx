'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseQuery } from '@tanstack/react-query';

import { Image } from '@/components/Image.js';
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
            {data.slice(0, 40).map((x) => {
                return <ProjectItem key={x.project_id} project={x} />;
            })}

            <div className="flex items-center justify-center gap-x-2 p-6 text-base text-secondary">
                <Image width={80} height={24} alt="rootdata" src="/image/rootdata.png" />
                <Trans>Top 40 Projects powered by Rootdata</Trans>
            </div>
        </div>
    );
}
