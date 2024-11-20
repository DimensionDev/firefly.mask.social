import { redirect, RedirectType } from 'next/navigation.js';

import { ExploreType } from '@/constants/enum.js';
import { resolveExploreUrl } from '@/helpers/resolveExploreUrl.js';

interface Props {
    params: {
        explore: ExploreType;
    };
}

export default function Page({ params }: Props) {
    redirect(resolveExploreUrl(params.explore), RedirectType.replace);
}
