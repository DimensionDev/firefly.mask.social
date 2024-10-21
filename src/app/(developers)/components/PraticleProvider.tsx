'use client';

import { AuthCoreContextProvider } from '@particle-network/authkit';
import type { ReactNode } from 'react';

import { env } from '@/constants/env.js';

interface ParticleProviderProps {
    children?: ReactNode;
}

export function ParticleProvider({ children }: ParticleProviderProps) {
    return (
        <AuthCoreContextProvider
            options={{
                appId: env.external.NEXT_PUBLIC_PARTICLE_APP_ID,
                projectId: env.external.NEXT_PUBLIC_W3M_PROJECT_ID,
                cilentKey: env.external.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
            }}
        >
            {children}
        </AuthCoreContextProvider>
    );
}
