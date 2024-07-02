import { t, Trans } from '@lingui/macro';

import { BaseNotFound } from '@/components/BaseNotFound.js';
import { IfPathname } from '@/components/IfPathname.js';
import { AsideSearchBar } from '@/components/Search/SearchBar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { Link } from '@/esm/Link.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Page not found`),
    });
}

export default function NotFound() {
    return (
        <>
            <BaseNotFound className="w-[888px] md:pl-[289px]">
                <div className="mt-11 text-sm font-bold">
                    <Trans>The page could not be found.</Trans>
                </div>
                <Link className="text-link underline md:hidden" href={'/'}>
                    <Trans>Back to home</Trans>
                </Link>
            </BaseNotFound>
            <aside className="top-0 z-[1] hidden h-full w-96 px-4 md:sticky lg:block">
                <IfPathname isNotOneOf={['/settings']}>
                    <AsideSearchBar />
                </IfPathname>
                <IfPathname isOneOf={['/search']}>
                    <SearchFilter />
                </IfPathname>
            </aside>
        </>
    );
}
