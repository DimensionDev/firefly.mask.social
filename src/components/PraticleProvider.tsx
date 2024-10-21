'use client';

import { AuthCoreContextProvider, PromptSettingType } from '@particle-network/authkit';
import { type ReactNode } from 'react';

import { chains } from '@/configs/wagmiClient.js';
import { env } from '@/constants/env.js';

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
                // You can prompt the user to set up extra security measures upon login or other interactions
                promptSettingConfig: {
                    promptPaymentPasswordSettingWhenSign: PromptSettingType.first,
                    promptMasterPasswordSettingWhenLogin: PromptSettingType.first,
                },
                wallet: {
                    // Set to false to remove the embedded wallet modal
                    visible: true,
                    customStyle: {
                        supportUIModeSwitch: true,
                        supportLanguageSwitch: false,
                    },
                },
            }}
        >
            {children}
        </AuthCoreContextProvider>
    );
}
