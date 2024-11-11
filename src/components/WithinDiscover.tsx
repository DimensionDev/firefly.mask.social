'use client';

import { usePathname, useSelectedLayoutSegments } from 'next/navigation.js';
import type { PropsWithChildren } from 'react';

export function WithinDiscover({ children }: PropsWithChildren) {
    const pathname = usePathname();
    const segments = useSelectedLayoutSegments();
    const withinDiscover = segments.includes('discover') || pathname === '/';
    return withinDiscover ? children : null;
}
