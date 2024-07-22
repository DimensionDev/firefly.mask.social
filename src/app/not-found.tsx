import { t, Trans } from '@lingui/macro';

import { BaseNotFound } from '@/components/BaseNotFound.js';
import { SuggestedChannels } from '@/components/Channel/SuggestedChannels.js';
import { IfPathname } from '@/components/IfPathname.js';
import { LinkCloud } from '@/components/LinkCloud.js';
import { AsideSearchBar } from '@/components/Search/SearchBar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { SuggestedFollowsCard } from '@/components/SuggestedFollows/SuggestedFollowsCard.js';
import { Source } from '@/constants/enum.js';
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
            <BaseNotFound className="min-h-[100vh] flex-grow md:pl-[289px]">
                <div className="mt-11 text-sm font-bold">
                    <Trans>The page could not be found.</Trans>
                </div>
                <Link className="text-link underline md:hidden" href={'/'}>
                    <Trans>Back to home</Trans>
                </Link>
            </BaseNotFound>
            <aside className="top-0 z-[1] hidden h-full w-96 flex-shrink-0 px-4 md:sticky lg:block">
                <IfPathname isNotOneOf={['/settings']}>
                    <AsideSearchBar />
                </IfPathname>
                <div className="no-scrollbar flex flex-1 flex-col gap-6 overflow-auto">
                    <IfPathname isOneOf={['/search']}>
                        <SearchFilter />
                    </IfPathname>
                    <IfPathname isNotOneOf={['/']} exact>
                        <SuggestedFollowsCard />
                        <SuggestedChannels source={Source.Farcaster} />
                    </IfPathname>
                    <LinkCloud />
                </div>
            </aside>
        </>
    );
}
