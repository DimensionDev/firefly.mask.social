import { ChainId, EthereumMethodType, isValidAddress } from '@masknet/web3-shared-evm';
import { AuthType, connect, disconnect, EthereumProvider, particleAuth } from '@particle-network/auth-core';
import { type Address, type Chain, numberToHex, RpcError, SwitchChainError, UserRejectedRequestError } from 'viem';
import { ChainNotConfiguredError, createConnector } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { AbortError, AuthenticationError, InvalidResultError } from '@/constants/error.js';
import { retry } from '@/helpers/retry.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

async function getProvider(signal?: AbortSignal) {
    return retry(
        async () => {
            if (typeof window === 'undefined') throw new AbortError();
            if (typeof window.particle === 'undefined') throw new InvalidResultError();
            if (typeof window.particle.ethereum === 'undefined') throw new InvalidResultError();
            return window.particle.ethereum as EthereumProvider;
        },
        {
            times: 5,
            interval: 300,
            signal,
        },
    );
}

interface ConnectorOptions {
    chains: readonly Chain[];
}

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
            // override particle wallet from EIP6963
            id: 'network.particle',
            name: 'Firefly Wallet',
            type: 'INJECTED',
            icon: '/firefly.png',
            async connect(options) {
                if (options?.isReconnecting && useGlobalState.getState().particleReconnecting) {
                    console.info(`[particle] cancel reconnect`);
                    throw new Error('Abort reconnecting.');
                }

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

                useGlobalState.getState().updateParticleReconnecting(false);

                return {
                    chainId: ChainId.Mainnet,
                    accounts: wallets.map((x) => x.public_address!) as Address[],
                };
            },
            async disconnect() {
                console.info(`[particle] disconnect`);

                useGlobalState.getState().updateParticleReconnecting(true);
                await runInSafeAsync(disconnect);

                console.info(`[particle] disconnected`);
            },
            async switchChain(parameters) {
                console.info(`[particle] switchChain`, parameters);

                const chain = options.chains.find((x) => x.id === parameters.chainId);
                if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

                try {
                    const provider = await getProvider();
                    await provider.request({
                        method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
                        params: [
                            {
                                chainId: numberToHex(parameters.chainId),
                            },
                        ],
                    });

                    const currentChainId = await this.getChainId();
                    if (currentChainId !== parameters.chainId) {
                        throw new UserRejectedRequestError(new Error('User rejected switch after adding network.'));
                    }
                } catch (error) {
                    console.error(`[particle] switchChain error`, error);
                    throw new SwitchChainError(error as RpcError);
                }

                return chain;
            },
            async getChainId() {
                const provider = await getProvider();
                const chainId = await provider.request({
                    method: EthereumMethodType.ETH_CHAIN_ID,
                    params: [],
                });
                return Number.parseInt(chainId, 16);
            },
            async getAccounts() {
                return [particleAuth.ethereum.selectedAddress as Address];
            },
            async getProvider() {
                return getProvider();
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
