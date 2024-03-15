import { IfPathname } from '@/components/IfPathname.js';
import { NavigatorBar } from '@/components/NavigatorBar/index.js';
import { AsideSearchBar, HeaderSearchBar } from '@/components/Search/SearchBar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <main
                className={`
              w-full flex-[1_1_100%] border-r border-line

              md:pl-[61px] lg:w-[888px] lg:max-w-[calc(100%-384px)]

              lg:pl-[289px]
            `}
            >
                <div className="sticky top-0 z-40 bg-primaryBottom pb-[1px]">
                    <IfPathname isNotOneOf={['/post', '/profile']}>
                        <NavigatorBar />
                    </IfPathname>
                    <HeaderSearchBar />
                    <SocialPlatformTabs />
                </div>
                {children}
            </main>
            <aside
                className={`
              sticky top-0 z-[1] hidden h-full w-96 px-4

              md:min-w-[384px]

              lg:block
            `}
            >
                <IfPathname isNotOneOf={['/settings']}>
                    <AsideSearchBar />
                </IfPathname>
                <IfPathname isOneOf={['/search']}>
                    <SearchFilter />
                </IfPathname>

                <div className="mt-6">
                    <mask-calendar-widget />
                </div>
            </aside>
        </>
    );
}
