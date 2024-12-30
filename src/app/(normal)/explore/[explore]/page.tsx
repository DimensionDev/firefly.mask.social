import { redirect, RedirectType } from 'next/navigation.js';

import { ProjectTrendingList } from '@/components/ProjectTrendingList.js';
import { ExploreType } from '@/constants/enum.js';
import { resolveExploreUrl } from '@/helpers/resolveExploreUrl.js';

interface Props {
    params: {
        explore: ExploreType;
    };
}

export default function Page({ params }: Props) {
    if (params.explore === ExploreType.Projects) return <ProjectTrendingList />;
    redirect(resolveExploreUrl(params.explore), RedirectType.replace);
}
