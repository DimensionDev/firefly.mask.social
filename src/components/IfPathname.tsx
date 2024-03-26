'use client';

import { usePathname } from 'next/navigation.js';
import type { ReactNode } from 'react';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';

interface IfPathname {
    exact?: boolean;
    isOneOf?: Array<`/${string}`>;
    isNotOneOf?: Array<`/${string}`>;
    children: ReactNode;
}

export function IfPathname({ exact, isOneOf, isNotOneOf, children }: IfPathname) {
    const pathname = usePathname();

    if (isOneOf?.some((includedPath) => isRoutePathname(pathname, includedPath, exact))) {
        return <>{children}</>;
    }

    if (isNotOneOf && !isNotOneOf.some((excludedPath) => isRoutePathname(pathname, excludedPath, exact))) {
        return <>{children}</>;
    }

    return null;
}
