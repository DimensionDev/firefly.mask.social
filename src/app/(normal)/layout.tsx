import { SuggestedChannels } from '@/components/Channel/SuggestedChannels.js';
import { ComposeButton } from '@/components/ComposeButton/index.js';
import { IfPathname } from '@/components/IfPathname.js';
import { LinkCloud } from '@/components/LinkCloud.js';
import { NavigatorBar } from '@/components/NavigatorBar/index.js';
import { AsideSearchBar, HeaderSearchBar } from '@/components/Search/SearchBar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { SourceTabs } from '@/components/SourceTabs.js';
import { SuggestedFollowsCard } from '@/components/SuggestedFollows/SuggestedFollowsCard.js';
import { Source, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';

export default function Layout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    return (
        <>
            <main className="flex w-full flex-[1_1_100%] flex-col md:border-r md:border-line md:pl-[289px] lg:w-[888px] lg:max-w-[calc(100%-384px)]">
                <div className="sticky top-0 z-40 bg-primaryBottom">
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
                            {
                                r: '/article/[^/]+$',
                                flags: 'i',
                            },
                            '/profile',
                            '/channel',
                            '/token',
                            '/nft',
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
                            {
                                r: '/post/[^/]+/\\w+/\\d+$', // image gallery
                                flags: 'i',
                            },
                            {
                                r: '/article/[^/]+$',
                                flags: 'i',
                            },
                            {
                                r: '/profile/[^/]+$',
                                flags: 'i',
                            },
                            {
                                r: '/nft/[^/]+$',
                                flags: 'i',
                            },
                            {
                                r: '/nft/[^/]+/\\w+$',
                                flags: 'i',
                            },
                            '/channel',
                            '/settings',
                            '/profile',
                            '/token',
                        ]}
                    >
                        <SourceTabs />
                    </IfPathname>
                </div>
                {children}
                {modal}
            </main>
            <aside className="sticky top-0 z-[1] hidden h-screen w-96 flex-col px-4 md:min-w-[384px] lg:flex">
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

                    <IfPathname isOneOf={['/']} exact>
                        {env.external.NEXT_PUBLIC_CALENDAR_WIDGET === STATUS.Enabled ? <mask-calendar-widget /> : null}
                    </IfPathname>

                    <LinkCloud />
                </div>
            </aside>
            <IfPathname isNotOneOf={['/token']}>
                <ComposeButton />
            </IfPathname>
        </>
    );
}
