import { ComposeButton } from '@/components/ComposeButton/index.js';
import { IfPathname } from '@/components/IfPathname.js';
import { NavigatorBar } from '@/components/NavigatorBar/index.js';
import { AsideSearchBar, HeaderSearchBar } from '@/components/Search/SearchBar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { SocialPlatformTabs } from '@/components/SocialPlatformTabs.js';

export default function Layout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    return (
        <>
            <main className="flex w-full flex-[1_1_100%] flex-col md:border-r md:border-line md:pl-[61px] lg:w-[888px] lg:max-w-[calc(100%-384px)] lg:pl-[289px]">
                <div className="sticky top-0 z-40 bg-primaryBottom pb-[1px]">
                    {/* add navigator bar for profile page */}
                    <IfPathname isOneOf={['/profile']} exact>
                        <NavigatorBar />
                    </IfPathname>

                    <IfPathname
                        isNotOneOf={[
                            {
                                r: '/post/[^/]+$',
                                flags: 'i',
                            },
                            {
                                r: '/post/[^/]+/\\w+$',
                                flags: 'i',
                            },
                            '/profile',
                            '/channel',
                        ]}
                    >
                        <NavigatorBar />
                    </IfPathname>

                    <HeaderSearchBar />

                    <IfPathname
                        isNotOneOf={[
                            {
                                r: '/post/[^/]+$',
                                flags: 'i',
                            },
                            {
                                r: '/post/[^/]+/\\w+$',
                                flags: 'i',
                            },
                            '/channel',
                            '/settings',
                        ]}
                    >
                        <SocialPlatformTabs />
                    </IfPathname>
                </div>
                {children}
                {modal}
            </main>
            <aside className="sticky top-0 z-[1] hidden h-full w-96 px-4 md:min-w-[384px] lg:block">
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
            <ComposeButton />
        </>
    );
}
