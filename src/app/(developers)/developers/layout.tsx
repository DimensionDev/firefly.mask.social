import { t } from '@lingui/macro';

import { ToolkitList } from '@/app/(developers)/components/ToolkitList.js';
import { NavigatorBar } from '@/components/NavigatorBar/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Developers`),
    });
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* desktop */}
            <main className="hidden min-h-screen w-full flex-1 pl-0 md:flex md:pl-[289px] lg:pl-72">
                <ToolkitList />
                {children}
            </main>

            {/* mobile */}
            <main className="flex min-h-screen w-full flex-col md:hidden">
                <div className="sticky top-0 z-10 bg-primaryBottom">
                    <NavigatorBar enableSearch={false} enableFixedBack />
                </div>
                <div>{children}</div>
            </main>
        </>
    );
}
