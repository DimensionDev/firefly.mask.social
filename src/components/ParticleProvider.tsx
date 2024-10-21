'use client';

// cspell: disable-next-line
import { AuthCoreContextProvider, PromptSettingType } from '@particle-network/authkit';
import { type ReactNode } from 'react';

import { chains } from '@/configs/wagmiClient.js';
import { env } from '@/constants/env.js';
import { SITE_DESCRIPTION } from '@/constants/index.js';
import { AuthType } from '@particle-network/auth-core';

interface ParticleProviderProps {
    children?: ReactNode;
}

export function ParticleProvider({ children }: ParticleProviderProps) {
    if (
        !env.external.NEXT_PUBLIC_PARTICLE_APP_ID ||
        !env.external.NEXT_PUBLIC_PARTICLE_CLIENT_KEY ||
        !env.external.NEXT_PUBLIC_PARTICLE_PROJECT_ID
    ) {
        console.warn(`[Particle] missing required environment variables.`);
        return null;
    }

    return (
        <AuthCoreContextProvider
            options={{
                chains,
                appId: env.external.NEXT_PUBLIC_PARTICLE_APP_ID,
                projectId: env.external.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
                clientKey: env.external.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
                authTypes: [AuthType.jwt],
                customStyle: {
                    logo: '/firefly.png',
                    projectName: 'Firefly',
                    subtitle: SITE_DESCRIPTION,
                },
                // You can prompt the user to set up extra security measures upon login or other interactions
                promptSettingConfig: {
                    promptPaymentPasswordSettingWhenSign: PromptSettingType.none,
                    promptMasterPasswordSettingWhenLogin: PromptSettingType.none,
                },
                wallet: {
                    // Set to false to remove the embedded wallet modal
                    visible: false,
                },
            }}
        >
            {children}
        </AuthCoreContextProvider>
    );
}
