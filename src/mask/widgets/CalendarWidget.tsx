'use client';

// eslint-disable-next-line simple-import-sort/imports
import { MaskRuntime } from '@/components/MaskRuntime.js';

import { CalendarContent } from '@masknet/plugin-calendar';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';
import { usePathname } from 'next/navigation.js';

import { Providers } from '@/app/provider.js';

export default function CalendarWidget() {
    const pathname = usePathname();

    console.log('DEBUG: pathname');
    console.log({
        pathname,
    });

    return (
        <Providers>
            <MaskRuntime>
                <DisableShadowRootContext.Provider value={false}>
                    <ShadowRootIsolation>
                        <CalendarContent />
                    </ShadowRootIsolation>
                </DisableShadowRootContext.Provider>
            </MaskRuntime>
        </Providers>
    );
}
