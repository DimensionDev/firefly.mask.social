import { particleAuth } from '@particle-network/auth-core';
import type { Address } from 'viem';
import { createConnector } from 'wagmi';

import { chains } from '@/configs/wagmiClient.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { NotImplementedError } from '@/constants/error.js';

interface ConnectorOptions {}

export function createParticleConnector({}: ConnectorOptions) {
    if (env.external.NEXt_PUBLIC_PARTICLE !== STATUS.Enabled) {
        console.warn(`Particle is disabled.`);
        return null;
    }

    return createConnector(() => {
        // init auth
        particleAuth.init({
            appId: env.external.NEXT_PUBLIC_PARTICLE_APP_ID ?? '',
            clientKey: env.external.NEXT_PUBLIC_PARTICLE_CLIENT_KEY ?? '',
            projectId: env.external.NEXT_PUBLIC_PARTICLE_PROJECT_ID ?? '',
            chains,
        });

        return {
            id: 'particle',
            name: 'Particle',
            type: 'Particle',
            async connect() {
                throw new NotImplementedError();
            },
            async disconnect() {
                throw new NotImplementedError();
            },
            async getAccounts() {
                return [particleAuth.ethereum.selectedAddress as Address];
            },
            async getChainId() {
                return Number.parseInt(particleAuth.ethereum.chainId, 10);
            },
            async getProvider() {
                return particleAuth.ethereum;
            },
            async isAuthorized() {
                return env.external.NEXt_PUBLIC_PARTICLE === STATUS.Enabled;
            },
            onAccountsChanged(account) {
                console.log(`[Particle] onAccountsChanged`, account);
            },
            onChainChanged(chainId) {
                console.log(`[Particle] onChainChanged`, chainId);
            },
            onConnect(connectInfo) {
                console.log(`[Particle] onConnect`, connectInfo);
            },
            onDisconnect(error) {
                console.log(`[Particle] onDisconnect`, error);
            },
            onMessage(message) {
                console.log(`[Particle] onMessage`, message);
            },
        };
    });
}
