'use client';

import { AuthCoreContextProvider, PromptSettingType } from '@particle-network/authkit';
import { type ReactNode, useMemo } from 'react';

import { chains } from '@/configs/wagmiClient.js';
import { STATUS, VERCEL_NEV } from '@/constants/enum.js';
import { env } from '@/constants/env.js';

type AuthCoreContextProviderOptions = Parameters<typeof AuthCoreContextProvider>[0]['options'];

interface ParticleProviderProps {
    children?: ReactNode;
}

export function ParticleProvider({ children }: ParticleProviderProps) {
    const options = useMemo(() => {
        if (env.external.NEXT_PUBLIC_PARTICLE === STATUS.Disabled) {
            console.warn(`[particle] disabled.`);
            return null;
        }
        if (
            !env.external.NEXT_PUBLIC_PARTICLE_APP_ID ||
            !env.external.NEXT_PUBLIC_PARTICLE_CLIENT_KEY ||
            !env.external.NEXT_PUBLIC_PARTICLE_PROJECT_ID
        ) {
            console.warn(`[particle] missing required environment variables.`);
            return null;
        }

        return {
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
                visible: env.external.NEXT_PUBLIC_VERCEL_ENV === VERCEL_NEV.Development,
            },
            // Disable inject the wagmi connector
            supportEIP6963: true,
        } satisfies AuthCoreContextProviderOptions;
    }, []);

    if (!options) return children;

    return <AuthCoreContextProvider options={options}>{children}</AuthCoreContextProvider>;
}
