import { t } from '@lingui/macro';
import { last } from 'lodash-es';
import { notFound } from 'next/navigation.js';
import { type PropsWithChildren } from 'react';

import { SearchTabs } from '@/components/Search/SearchTabs.js';
import { SearchType, SourceInURL } from '@/constants/enum.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

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

type Props = PropsWithChildren<{
    params: Promise<{ slug: string[] }>;
}>;

export async function generateMetadata(props: Props) {
    const params = await props.params;
    const { slug } = params;

    if (!checkSlug(slug)) {
        return createSiteMetadata({
            title: await createPageTitleSSR(t`Search`),
        });
    }

    const searchTypeTitle = {
        [SearchType.Profiles]: t`Search user`,
        [SearchType.Posts]: t`Search post`,
        [SearchType.Channels]: t`Search channel`,
        [SearchType.NFTs]: t`Search nft`,
        [SearchType.Tokens]: t`Search token`,
    }[last(slug) as SearchType];

    return createSiteMetadata({
        title: await createPageTitleSSR(searchTypeTitle || t`Search`),
    });
}

export default async function SearchLayout(props: Props) {
    const params = await props.params;
    const { children } = props;

    if (!checkSlug(params.slug)) notFound();

    return (
        <div>
            <SearchTabs />
            {children}
        </div>
    );
}
