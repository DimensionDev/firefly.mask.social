'use client';

import { usePathname } from 'next/navigation.js';
import { type ReactNode, useState } from 'react';
import { useUpdateEffect } from 'react-use';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';

interface RE {
    r: string;
    flags?: string;
}

interface IfPathname {
    exact?: boolean;
    isOneOf?: Array<`/${string}` | RE>;
    isNotOneOf?: Array<`/${string}` | RE>;
    children: ReactNode;
}

export function IfPathname({ exact = false, isOneOf, isNotOneOf, children }: IfPathname) {
    const pathname = usePathname();
    const [lastPathname, setLastPathname] = useState(
        !isRoutePathname(pathname, '/post/:detail/photos/:index', true) ? pathname : '',
    );

    useUpdateEffect(() => {
        if (isRoutePathname(pathname, '/post/:detail/photos/:index', true)) return;

        setLastPathname(pathname);
    }, [pathname]);

    if (
        isOneOf &&
        isOneOf.some((includedPath) =>
            typeof includedPath === 'string'
                ? isRoutePathname(lastPathname, includedPath, exact)
                : new RegExp(includedPath.r, includedPath.flags).test(lastPathname),
        )
    ) {
        return <>{children}</>;
    }

    if (
        isNotOneOf &&
        !isNotOneOf.some((excludedPath) =>
            typeof excludedPath === 'string'
                ? isRoutePathname(lastPathname, excludedPath, exact)
                : new RegExp(excludedPath.r, excludedPath.flags).test(lastPathname),
        )
    ) {
        return <>{children}</>;
    }

    return null;
}
