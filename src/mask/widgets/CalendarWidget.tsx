'use client';

import { CalendarContent } from '@masknet/plugin-calendar';
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme';
import { usePathname } from 'next/navigation.js';

import { MaskRuntime } from '@/components/MaskRuntime.js';

export function CalendarWidget() {
    const pathname = usePathname();
    const isSettingsPage = pathname.startsWith('/settings');

    if (isSettingsPage) return null;

    return (
        <MaskRuntime>
            <DisableShadowRootContext.Provider value={false}>
                <ShadowRootIsolation>
                    <CalendarContent />
                </ShadowRootIsolation>
            </DisableShadowRootContext.Provider>
        </MaskRuntime>
    );
}
