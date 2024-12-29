import { SpeedInsights } from '@vercel/speed-insights/next';

import { BeforeUnload } from '@/components/Compose/BeforeUnload.js';
import { IfHostname } from '@/components/IfHostname.js';
import { IfPathname } from '@/components/IfPathname.js';
import { NoSSR } from '@/components/NoSSR.js';
import { Providers } from '@/components/Providers.js';
import { RouteProgressBar } from '@/components/RouteProgressBar.js';
import { SideBar } from '@/components/SideBar/index.js';
import { CZ_ACTIVITY_HOSTNAME } from '@/constants/index.js';
import { Script } from '@/esm/Script.js';
import { Modals } from '@/modals/index.js';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'mask-page-inspector': any;
        }
    }
}
export function LayoutBody({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Providers enableInsights>
                <div className="m-auto flex w-full md:min-h-screen group-[.not-support]:md:min-h-[calc(100vh_-_38px)] lg:w-[1265px]">
                    {children}
                    <IfHostname isNotOneOf={[CZ_ACTIVITY_HOSTNAME]}>
                        <IfPathname isNotOneOf={['/login/desktop', '/activity/cz', '/event', '/events', '/frame']}>
                            <SideBar />
                        </IfPathname>
                    </IfHostname>
                    <IfPathname isNotOneOf={['/frame']}>
                        <NoSSR>
                            <mask-page-inspector />
                        </NoSSR>
                    </IfPathname>
                </div>

                <Modals />
                <RouteProgressBar
                    height="2px"
                    color="var(--color-firefly-brand)"
                    options={{ showSpinner: false }}
                    shallowRouting
                />
            </Providers>
            <SpeedInsights />
            <BeforeUnload />
            <Script src="https://cdn.jsdelivr.net/npm/bowser@2.11.0/es5.min.js" async strategy="beforeInteractive" />
        </>
    );
}
