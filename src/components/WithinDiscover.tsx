'use client';

import { usePathname, useSelectedLayoutSegments } from 'next/navigation.js';
import type { PropsWithChildren, ReactNode } from 'react';

interface Props extends PropsWithChildren {
    otherwise?: ReactNode;
}

export function WithinDiscover({ children, otherwise }: Props) {
    const pathname = usePathname();
    const segments = useSelectedLayoutSegments();
    const withinDiscover = segments.includes('discover') || segments.includes('explore') || pathname === '/';
    return withinDiscover ? children : otherwise;
}
