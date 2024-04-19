'use client';

import { usePathname } from 'next/navigation.js';
import type { ReactNode } from 'react';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';

interface IfPathname {
    exact?: boolean;
    isOneOf?: Array<`/${string}` | RegExp>;
    isNotOneOf?: Array<`/${string}` | RegExp>;
    children: ReactNode;
}

export function IfPathname({ exact = false, isOneOf, isNotOneOf, children }: IfPathname) {
    const pathname = usePathname();

    if (
        isOneOf &&
        isOneOf.some((includedPath) =>
            typeof includedPath === 'string'
                ? isRoutePathname(pathname, includedPath, exact)
                : includedPath.test(pathname),
        )
    ) {
        return <>{children}</>;
    }

    if (
        isNotOneOf &&
        !isNotOneOf.some((excludedPath) =>
            typeof excludedPath === 'string'
                ? isRoutePathname(pathname, excludedPath, exact)
                : excludedPath.test(pathname),
        )
    ) {
        return <>{children}</>;
    }

    return null;
}
