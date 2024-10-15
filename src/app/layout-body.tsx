'use client';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { lazy } from 'react';

import { BeforeUnload } from '@/components/Compose/BeforeUnload.js';
import { IfHostname } from '@/components/IfHostname.js';
import { IfPathname } from '@/components/IfPathname.js';
import { Providers } from '@/components/Providers.js';
import { RouteProgressBar } from '@/components/RouteProgressBar.js';
import { SideBar } from '@/components/SideBar/index.js';
import { NODE_ENV, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { CZ_ACTIVITY_HOSTNAME } from '@/constants/index.js';
import { Script } from '@/esm/Script.js';
import { Modals } from '@/modals/index.js';

// @ts-ignore
const CustomElements = lazy(() => {
    if (
        env.shared.NODE_ENV !== NODE_ENV.Development ||
        (env.shared.NODE_ENV === NODE_ENV.Development &&
            env.external.NEXT_PUBLIC_MASK_WEB_COMPONENTS === STATUS.Enabled)
    ) {
        return import('@/components/CustomElements.js');
    }

    // disable mask web components
    return Promise.resolve({
        default: () => null,
    });
});

export function LayoutBody({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Providers>
                <CustomElements />
                <div className="m-auto flex w-full md:min-h-screen group-[.not-support]:md:min-h-[calc(100vh_-_38px)] lg:w-[1265px]">
                    {children}
                    <IfHostname isNotOneOf={[CZ_ACTIVITY_HOSTNAME]}>
                        <IfPathname isNotOneOf={['/login/desktop', '/activity/cz']}>
                            <SideBar />
                        </IfPathname>
                    </IfHostname>

                    <mask-page-inspector />
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
