'use client';

import type { PropsWithChildren } from 'react';

import { ActivityDesktopNavigationBar } from '@/components/Activity/ActivityDesktopNavigationBar.js';
import { ActivityMobileNavigationBar } from '@/components/Activity/ActivityMobileNavigationBar.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export function ActivityNavigationBar({ children }: PropsWithChildren) {
    if (fireflyBridgeProvider.supported) {
        return <ActivityMobileNavigationBar>{children}</ActivityMobileNavigationBar>;
    }
    return <ActivityDesktopNavigationBar>{children}</ActivityDesktopNavigationBar>;
}
