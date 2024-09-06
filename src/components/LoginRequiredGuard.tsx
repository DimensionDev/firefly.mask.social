'use client';

import type { PropsWithChildren, ReactNode } from 'react';

import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { Source } from '@/constants/enum.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';

export function LoginRequiredGuard({
    source,
    children,
    fallback,
}: PropsWithChildren<{ source: Source; fallback?: ReactNode }>) {
    const isLogin = useIsLogin(isSocialSource(source) ? source : undefined);

    if (isSocialSource(source) && !isLogin && source === Source.Twitter) {
        return fallback ?? <NotLoginFallback source={source} />;
    }

    return children;
}
