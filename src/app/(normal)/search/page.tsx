import { t } from '@lingui/macro';
import { redirect } from 'next/navigation.js';

import type { SearchType } from '@/constants/enum.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: await createPageTitleSSR(t`Search`),
    });
}

interface SearchPageProps {
    searchParams: Promise<{
        type: SearchType;
        q: string;
    }>;
}

export default async function Page(props: SearchPageProps) {
    const searchParams = await props.searchParams;
    redirect(resolveSearchUrl(searchParams.q, searchParams.type));
}
