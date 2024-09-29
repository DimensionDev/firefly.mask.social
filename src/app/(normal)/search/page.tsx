import { t } from '@lingui/macro';
import { redirect } from 'next/navigation.js';

import type { SearchType } from '@/constants/enum.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Search`),
    });
}

interface SearchPageProps {
    searchParams: {
        type: SearchType;
        q: string;
    };
}

export default function Page({ searchParams }: SearchPageProps) {
    return redirect(resolveSearchUrl(searchParams.q, searchParams.type));
}
