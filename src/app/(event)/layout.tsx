'use client';

import { useEffect } from 'react';

import { setLocaleByFireflyBridge } from '@/components/Activity/helpers/setLocaleByFireflyBridge.js';
import { SuggestedChannels } from '@/components/Channel/SuggestedChannels.js';
import { IfPathname } from '@/components/IfPathname.js';
import { LinkCloud } from '@/components/LinkCloud.js';
import { NavigatorBar } from '@/components/NavigatorBar/index.js';
import { AsideSearchBar, HeaderSearchBar } from '@/components/Search/SearchBar.js';
import { SideBar } from '@/components/SideBar/index.js';
import { SuggestedFollowsCard } from '@/components/SuggestedFollows/SuggestedFollowsCard.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export default function Layout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        setLocaleByFireflyBridge();
    }, []);
    if (fireflyBridgeProvider.supported) return children;
    return (
        <>
            <SideBar />
            <main className="flex w-full flex-[1_1_100%] flex-col md:border-r md:border-line md:pl-[235px] lg:w-[888px] lg:max-w-[calc(100%-384px)] lg:pl-[289px]">
                <div className="sticky top-0 z-40 bg-primaryBottom">
                    <HeaderSearchBar />
                    <IfPathname isOneOf={[PageRoute.Events]}>
                        <NavigatorBar />
                    </IfPathname>
                </div>
                {children}
            </main>
            <aside className="sticky top-0 z-[1] hidden h-screen w-96 flex-col gap-4 px-4 md:min-w-[384px] lg:flex">
                <div className="no-scrollbar flex flex-1 flex-col gap-4 overflow-auto">
                    <AsideSearchBar />
                    <SuggestedFollowsCard />
                    <SuggestedChannels source={Source.Farcaster} />
                    <LinkCloud />
                </div>
            </aside>
        </>
    );
}
