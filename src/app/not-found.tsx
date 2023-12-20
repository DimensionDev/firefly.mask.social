'use client';

import { Trans } from '@lingui/macro';

import { IfPathname } from '@/components/IfPathname.js';
import { AsideSearchBar } from '@/components/Search/SearchBar.js';
import { SearchFilter } from '@/components/Search/SearchFilter.js';
import { Image } from '@/esm/Image.js';

export default function NotFound() {
    return (
        <>
            <main className="max-w-[888px] flex-[1_1_100%] border-r border-line pl-[289px]">
                <div className="flex h-screen flex-col items-center justify-center">
                    <Image
                        src="/image/radar.png"
                        width={200}
                        height={106}
                        alt="Something went wrong, Please try again."
                    />
                    <div className="mt-11 text-sm font-bold">
                        <Trans>The page could be found.</Trans>
                    </div>
                </div>
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
