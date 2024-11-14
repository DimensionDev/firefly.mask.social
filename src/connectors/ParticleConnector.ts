import { t } from '@lingui/macro';
import { EthereumMethodType, isValidAddress } from '@masknet/web3-shared-evm';
import { AuthType, connect, disconnect, EthereumProvider, particleAuth } from '@particle-network/auth-core';
import { type Address, type Chain, numberToHex, RpcError, SwitchChainError, UserRejectedRequestError } from 'viem';
import { ChainNotConfiguredError, createConnector, type CreateConnectorFn } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import { STATUS, WalletSource } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { AbortError, AuthenticationError, InvalidResultError, NotAllowedError } from '@/constants/error.js';
import { enqueueWarningMessage } from '@/helpers/enqueueMessage.js';
import { retry } from '@/helpers/retry.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
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

export function createParticleConnector(options: ConnectorOptions): CreateConnectorFn | null {
    if (env.external.NEXT_PUBLIC_PARTICLE !== STATUS.Enabled) {
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
            async connect(parameters) {
                if (parameters?.isReconnecting && useGlobalState.getState().particleReconnecting) {
                    console.info(`[particle] cancel reconnect`);
                    throw new AbortError('[particle] Reconnecting');
                }

                console.info(`[particle] connect`);

                if (!fireflySessionHolder.session)
                    throw new AuthenticationError('[particle] Firefly session not found');

                const connections = await FireflyEndpointProvider.getAccountConnections();
                const connectedEthWallets = connections?.wallet.connected.filter(
                    (x) => x.platform === 'eth' && x.source === WalletSource.Particle,
                );
                if (!connectedEthWallets?.length) {
                    enqueueWarningMessage(t`You haven't generated a Firefly wallet yet.`);
                    throw new NotAllowedError('[particle] Not generated a Firefly wallet before');
                }

                const chain = options.chains.find((x) => x.id === parameters?.chainId) ?? mainnet;
                const user = await connect({
                    chain,
                    provider: AuthType.jwt,
                    // cspell: disable-next-line
                    thirdpartyCode: fireflySessionHolder.session?.token,
                });

                console.info(`[particle] connected`, user);

                const wallets = user.wallets.filter(
                    (x) => x.chain_name === 'evm_chain' && isValidAddress(x.public_address),
                );
                if (!wallets.length) {
                    throw new Error('[particle] Wallet not found');
                }

                useGlobalState.getState().updateParticleReconnecting(false);

                try {
                    await FireflyEndpointProvider.reportParticle();
                } catch (error) {
                    throw new NotAllowedError('[particle] Failed to connect to Firefly');
                }

                return {
                    chainId: chain.id,
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
