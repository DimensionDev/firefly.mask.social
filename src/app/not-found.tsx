import { t, Trans } from '@lingui/macro';

import { IfPathname } from '@/components/IfPathname.js';
import { AsideSearchBar } from '@/components/Search/SearchBar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { Image } from '@/esm/Image.js';
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
            <main className="w-[888px] flex-[1_1_100%] border-r border-line md:pl-[289px]">
                <div className="flex h-screen flex-col items-center justify-center">
                    <Image src="/image/radar.png" width={200} height={106} alt={t`Page not found. Please try again.`} />
                    <div className="mt-11 text-sm font-bold">
                        <Trans>The page could not be found.</Trans>
                    </div>
                    <Link className='md:hidden text-link underline' href={'/'}>
                        <Trans>Back to home</Trans>
                    </Link>
                </div>
            </main>
            <aside className="hidden md:sticky top-0 z-[1] h-full w-96 px-4 lg:block">
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
