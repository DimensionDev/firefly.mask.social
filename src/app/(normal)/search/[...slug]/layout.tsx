import { t } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { SearchTabs } from '@/components/Search/SearchTabs.js';
import { SearchType, SourceInURL } from '@/constants/enum.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Search`),
    });
}

function checkSlug(slug: string[]) {
    if (slug.length === 1) {
        return [SearchType.Profiles, SearchType.NFTs, SearchType.Tokens].includes(slug[0] as SearchType);
    }

    if (slug.length === 2) {
        return (
            [SourceInURL.Farcaster, SourceInURL.Lens, SourceInURL.Twitter].includes(slug[0] as SourceInURL) &&
            [SearchType.Profiles, SearchType.Posts, SearchType.Channels].includes(slug[1] as SearchType)
        );
    }

    return false;
}

export default function SearchLayout({
    params,
    children,
}: PropsWithChildren<{
    params: { slug: string[] };
}>) {
    if (!checkSlug(params.slug)) return notFound();

    return (
        <div>
            <SearchTabs />
            {children}
        </div>
    );
}
