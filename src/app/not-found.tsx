import { t, Trans } from '@lingui/macro';

import { BaseNotFound } from '@/components/BaseNotFound.js';
import { SuggestedChannels } from '@/components/Channel/SuggestedChannels.js';
import { IfPathname } from '@/components/IfPathname.js';
import { LinkCloud } from '@/components/LinkCloud.js';
import { AsideSearchBar } from '@/components/Search/SearchBar.js';
import { SuggestedFollowsCard } from '@/components/SuggestedFollows/SuggestedFollowsCard.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { setupLocaleForSSR } from '@/i18n/index.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Page not found`),
    });
}

export default function NotFound() {
    setupLocaleForSSR();

    return (
        <>
            <BaseNotFound className="min-h-[100vh] flex-grow md:pl-[235px] lg:pl-[289px]">
                <div className="mt-11 text-sm font-bold">
                    <Trans>The page could not be found.</Trans>
                </div>
                <Link className="text-link underline md:hidden" href={PageRoute.Home}>
                    <Trans>Back to home</Trans>
                </Link>
            </BaseNotFound>
            <aside className="sticky top-0 z-[1] hidden h-screen w-96 flex-col gap-4 px-4 md:min-w-[384px] lg:flex">
                <IfPathname isNotOneOf={[PageRoute.Settings]}>
                    <AsideSearchBar />
                </IfPathname>
                <div className="no-scrollbar flex flex-1 flex-col gap-4 overflow-auto">
                    <IfPathname isNotOneOf={[PageRoute.Home]} exact>
                        <SuggestedFollowsCard />
                        <SuggestedChannels source={Source.Farcaster} />
                    </IfPathname>
                    <LinkCloud />
                </div>
            </aside>
        </>
    );
}
