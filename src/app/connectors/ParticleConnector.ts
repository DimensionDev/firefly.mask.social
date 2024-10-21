import { ChainId, isValidAddress } from '@masknet/web3-shared-evm';
import { AuthType, connect, disconnect, particleAuth } from '@particle-network/auth-core';
import type { Address } from 'viem';
import { createConnector } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { AuthenticationError } from '@/constants/error.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

interface ConnectorOptions {}

export function createParticleConnector(options: ConnectorOptions) {
    if (env.external.NEXT_PUBLIC_PARTICLE !== STATUS.Enabled) {
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

    console.info(`[particle] enabled`);

    return createConnector(() => {
        return {
            id: 'firefly-wallet',
            name: 'Firefly Wallet',
            type: 'firefly-wallet',
            icon: '/firefly.png',
            async connect() {
                console.info(`[particle] connect`);

                if (!fireflySessionHolder.session) throw new AuthenticationError('Firefly session not found');

                const user = await connect({
                    chain: mainnet,
                    provider: AuthType.jwt,
                    // cspell: disable-next-line
                    thirdpartyCode: fireflySessionHolder.session?.token,
                });

                console.info(`[particle] connected`, user);

                const wallets = user.wallets.filter(
                    (x) => x.chain_name === 'evm_chain' && isValidAddress(x.public_address),
                );
                if (!wallets.length) {
                    console.error(`[particle] wallet not found`);
                    throw new AuthenticationError('Wallet not found');
                }

                return {
                    chainId: ChainId.Mainnet,
                    accounts: wallets.map((x) => x.public_address!) as Address[],
                };
            },
            async disconnect() {
                console.info(`[particle] disconnect`);
                await disconnect();
            },
            async getAccounts() {
                return [particleAuth.ethereum.selectedAddress as Address];
            },
            async getChainId() {
                return Number.parseInt(particleAuth.ethereum.chainId, 16);
            },
            async getProvider() {
                return particleAuth.ethereum;
            },
            async isAuthorized() {
                return env.external.NEXT_PUBLIC_PARTICLE === STATUS.Enabled;
            },
            onAccountsChanged(account) {
                console.log(`[particle] onAccountsChanged`, account);
            },
            onChainChanged(chainId) {
                console.log(`[particle] onChainChanged`, chainId);
            },
            onConnect(connectInfo) {
                console.log(`[particle] onConnect`, connectInfo);
            },
            onDisconnect(error) {
                console.log(`[particle] onDisconnect`, error);
            },
            onMessage(message) {
                console.log(`[particle] onMessage`, message);
            },
        };
    });
}
