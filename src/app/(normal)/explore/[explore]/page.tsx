import { redirect, RedirectType } from 'next/navigation.js';

import { ProjectTrendingList } from '@/components/ProjectTrendingList.js';
import { ExploreType } from '@/constants/enum.js';
import { resolveExploreUrl } from '@/helpers/resolveExploreUrl.js';

interface Props {
    params: Promise<{
        explore: ExploreType;
    }>;
}

export default async function Page(props: Props) {
    const params = await props.params;
    if (params.explore === ExploreType.Projects) return <ProjectTrendingList />;
    redirect(resolveExploreUrl(params.explore), RedirectType.replace);
}
