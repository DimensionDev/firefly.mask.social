import { Advertisement } from '@/components/Advertisement.js';
import { CalendarContent } from '@/components/Calendar/CalendarContent.js';
import { SuggestedChannels } from '@/components/Channel/SuggestedChannels.js';
import { ComposeWatcher } from '@/components/Compose/ComposeWatcher.js';
import { ComposeButton } from '@/components/ComposeButton/index.js';
import { IfPathname } from '@/components/IfPathname.js';
import { LinkCloud } from '@/components/LinkCloud.js';
import { NavigatorBar } from '@/components/NavigatorBar/index.js';
import { AsideSearchBar, HeaderSearchBar } from '@/components/Search/SearchBar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { Section } from '@/components/Semantic/Section.js';
import { SuggestedFollowsCard } from '@/components/SuggestedFollows/SuggestedFollowsCard.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { DEFAULT_SOCIAL_SOURCE, DISCOVER_SOURCES, DISCOVER_TYPES, SOCIAL_DISCOVER_SOURCE } from '@/constants/index.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export default function Layout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    return (
        <>
            <main className="flex w-full flex-[1_1_100%] flex-col md:border-r md:border-line md:pl-[289px] lg:w-[888px] lg:max-w-[calc(100%-384px)]">
                <div className="sticky top-0 z-40 bg-primaryBottom">
                    <IfPathname
                        isNotOneOf={[
                            {
                                r: '^/post/[^/]+$',
                                flags: 'i',
                            },
                            {
                                r: '^/post/[^/]+/\\w+$',
                                flags: 'i',
                            },
                            {
                                r: '^/article/[^/]+$',
                                flags: 'i',
                            },
                            '/channel',
                            '/token',
                            '/nft',
                        ]}
                    >
                        <NavigatorBar />
                    </IfPathname>

                    <HeaderSearchBar />
                </div>
                {children}
                {modal}
            </main>
            <aside className="sticky top-0 z-[1] hidden h-screen w-96 flex-col gap-4 px-4 md:min-w-[384px] lg:flex">
                <IfPathname isNotOneOf={[PageRoute.Settings]}>
                    <AsideSearchBar />
                </IfPathname>

                <div className="no-scrollbar flex flex-1 flex-col gap-4 overflow-auto">
                    <IfPathname isOneOf={[PageRoute.Search]}>
                        <SearchFilter />
                    </IfPathname>

                    <IfPathname isNotOneOf={[PageRoute.Settings, PageRoute.Search]}>
                        <Section title="Advertisement">
                            <Advertisement />
                        </Section>
                    </IfPathname>

                    <IfPathname
                        isNotOneOf={[
                            {
                                r: '^/$',
                                flags: 'i',
                            },
                            {
                                r: `^/(${DISCOVER_SOURCES.map(resolveSourceInUrl).join('|')})$`,
                                flags: 'i',
                            },
                            {
                                r: `^/(${SOCIAL_DISCOVER_SOURCE.map(resolveSourceInUrl).join('|')})/(${DISCOVER_TYPES[DEFAULT_SOCIAL_SOURCE].join('|')})$`,
                                flags: 'i',
                            },
                        ]}
                    >
                        <SuggestedFollowsCard />
                        <SuggestedChannels source={Source.Farcaster} />
                    </IfPathname>

                    <IfPathname
                        isOneOf={[
                            {
                                r: '^/$',
                                flags: 'i',
                            },
                            {
                                r: `^/(${DISCOVER_SOURCES.map(resolveSourceInUrl).join('|')})$`,
                                flags: 'i',
                            },
                            {
                                r: `^/(${SOCIAL_DISCOVER_SOURCE.map(resolveSourceInUrl).join('|')})/(${DISCOVER_TYPES[DEFAULT_SOCIAL_SOURCE].join('|')})$`,
                                flags: 'i',
                            },
                        ]}
                    >
                        <Section title="Web3 Calendar">
                            <CalendarContent />
                        </Section>
                    </IfPathname>

                    <LinkCloud />
                </div>
            </aside>
            <IfPathname isNotOneOf={['/token']}>
                <ComposeButton />
            </IfPathname>
            <ComposeWatcher />
        </>
    );
}
