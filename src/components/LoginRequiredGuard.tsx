'use client';

import type { HTMLProps, PropsWithChildren, ReactNode } from 'react';

import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { Source } from '@/constants/enum.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';

interface Props extends HTMLProps<HTMLDivElement> {
    source: Source;
    fallback?: ReactNode;
}

export function LoginRequiredGuard({ source, children, fallback, className }: PropsWithChildren<Props>) {
    const isLogin = useIsLogin(isSocialSource(source) ? source : undefined);

    if (!isLogin && source === Source.Twitter) {
        return fallback ?? <NotLoginFallback source={source} className={className} />;
    }

    return children;
}
