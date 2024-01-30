import { lazy } from 'react';

import { IfPathname } from '@/components/IfPathname.js';
import { AsideSearchBar, HeaderSearchBar } from '@/components/Search/SearchBar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';

// @ts-ignore
const CustomElements = lazy(() => import('@/components/CustomElements.js'));

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <CustomElements />
            <main className="flex-[1_1_100%] border-r border-line md:max-w-[calc(100%-384px)] md:pl-[61px] lg:w-[888px] lg:pl-[289px]">
                <div className="sticky top-0 z-[98] bg-primaryBottom pb-[1px]">
                    <HeaderSearchBar />
                    <SocialPlatformTabs />
                </div>
                {children}
            </main>
            <aside className="sticky top-0 z-[1] h-full w-96 px-4 md:min-w-[384px] lg:block">
                <IfPathname isNotOneOf={['/settings']}>
                    <AsideSearchBar />
                </IfPathname>
                <IfPathname isOneOf={['/search']}>
                    <SearchFilter />
                </IfPathname>

                <div className="mt-6">
                    <mask-calendar-widget />
                </div>
                <mask-page-inspector />
            </aside>
        </>
    );
}
