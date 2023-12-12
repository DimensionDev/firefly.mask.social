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
            {process.env.NODE_ENV !== 'development' ||
            (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MASK_WEB_COMPONENTS === 'enabled') ? (
                <CustomElements />
            ) : null}
            <main className="max-w-[888px] flex-1 border-r border-line pl-72">
                <div className="sticky top-0 z-[998] border-b border-line bg-primaryBottom pb-[1px]">
                    <HeaderSearchBar />
                    <SocialPlatformTabs />
                </div>
                {children}
            </main>
            <aside className=" sticky top-0 z-[1] h-full w-96 px-4 lg:block">
                <IfPathname isNotOneOf={['/settings']}>
                    <AsideSearchBar />
                </IfPathname>
                <IfPathname isOneOf={['/search']}>
                    <SearchFilter />
                </IfPathname>

                <mask-calendar-widget />
                <mask-page-inspector />
            </aside>
        </>
    );
}
