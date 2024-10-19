import { ChainId, isValidAddress } from '@masknet/web3-shared-evm';
import { AuthType, connect, disconnect, particleAuth } from '@particle-network/auth-core';
import type { Address } from 'viem';
import { createConnector } from 'wagmi';

import { chains } from '@/configs/wagmiClient.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { AuthenticationError, NotImplementedError } from '@/constants/error.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

interface ConnectorOptions {}

export function createParticleConnector(options: ConnectorOptions) {
    if (env.external.NEXT_PUBLIC_PARTICLE !== STATUS.Enabled) {
        console.warn(`[Particle] disabled.`);
        return null;
    }

    if (
        !env.external.NEXT_PUBLIC_PARTICLE_APP_ID ||
        !env.external.NEXT_PUBLIC_PARTICLE_CLIENT_KEY ||
        !env.external.NEXT_PUBLIC_PARTICLE_PROJECT_ID
    ) {
        console.warn(`[Particle] missing required environment variables.`);
        return null;
    }

    console.info(`[Particle] enabled`);

    return createConnector(() => {
        // init auth
        particleAuth.init({
            appId: env.external.NEXT_PUBLIC_PARTICLE_APP_ID!,
            clientKey: env.external.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
            projectId: env.external.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
            chains,
        });

        return {
            id: 'particle',
            name: 'Particle',
            type: 'Particle',
            async connect() {
                if (!fireflySessionHolder.session) throw new AuthenticationError('Firefly session not found');

                const user = await connect({
                    provider: AuthType.jwt,
                    // cspell: disable-next-line
                    thirdpartyCode: fireflySessionHolder.session?.token,
                });

                console.info(`[Particle] connected`, user);

                const wallet = user.wallets.find((x) => x.chain_name === 'evm_chain');
                if (!isValidAddress(wallet?.public_address)) {
                    console.error(`[Particle] wallet not found`);
                    throw new AuthenticationError('Wallet not found');
                }

                return {
                    chainId: ChainId.Mainnet,
                    accounts: [wallet.public_address as Address],
                };
            },
            async disconnect() {
                await disconnect();
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
                return env.external.NEXT_PUBLIC_PARTICLE === STATUS.Enabled;
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
