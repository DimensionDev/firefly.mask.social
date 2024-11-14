import { t } from '@lingui/macro';
import { AuthType, connect, SolanaWallet } from '@particle-network/auth-core';
import type { SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    isVersionedTransaction,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type {
    Connection,
    Transaction,
    TransactionSignature,
    TransactionVersion,
    VersionedTransaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

import { WalletSource } from '@/constants/enum.js';
import { AbortError, AuthenticationError, InvalidResultError } from '@/constants/error.js';
import { enqueueWarningMessage } from '@/helpers/enqueueMessage.js';
import { isValidSolanaAddress } from '@/helpers/isValidSolanaAddress.js';
import { retry } from '@/helpers/retry.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

async function getProvider(signal?: AbortSignal) {
    return retry(
        async () => {
            if (typeof window === 'undefined') throw new AbortError();
            if (typeof window.particle === 'undefined') throw new InvalidResultError();
            if (typeof window.particle.solana === 'undefined') throw new InvalidResultError();
            return window.particle.solana as SolanaWallet;
        },
        {
            times: 5,
            interval: 300,
            signal,
        },
    );
}

export interface ParticleSolanaWalletAdapterConfig {}

export const ParticleSolanaWalletName = 'Firefly Wallet' as WalletName<'Firefly Wallet'>;

function formatError(error: unknown, fallback = '') {
    if (error instanceof Error) return error.message;

    return fallback;
}

export class ParticleSolanaWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = ParticleSolanaWalletName;
    url = 'https://firefly.social/';
    icon = '/firefly.png';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _connecting: boolean;
    private _wallet: SolanaWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: ParticleSolanaWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.particle?.solana?.isParticleNetwork) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get readyState() {
        return this._readyState;
    }

    override async autoConnect(): Promise<void> {
        if (this.readyState === WalletReadyState.Installed) {
            await this.connect();
        }
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;

            if (this.readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = await getProvider();

            if (!wallet.isConnected) {
                if (!fireflySessionHolder.session) throw new AuthenticationError('Firefly session not found');

                const connections = await FireflyEndpointProvider.getAccountConnections();
                const connectedSolanaWallets = connections?.wallet.connected.filter(
                    (x) => x.platform === 'solana' && x.source === WalletSource.Particle,
                );
                if (!connectedSolanaWallets?.length) {
                    enqueueWarningMessage(t`You haven't generated a Firefly wallet yet.`);
                    throw new Error(t`You haven't generated a Firefly wallet yet.`);
                }

                const user = await connect({
                    provider: AuthType.jwt,
                    // cspell: disable-next-line
                    thirdpartyCode: fireflySessionHolder.session?.token,
                });

                console.info(`[particle solana] connected`, user);

                const wallets = user.wallets.filter(
                    (x) => x.chain_name === 'solana' && isValidSolanaAddress(x.public_address),
                );
                if (!wallets.length) {
                    console.error(`[particle solana] wallet not found`);
                    throw new AuthenticationError('Wallet not found');
                }

                try {
                    await FireflyEndpointProvider.reportParticle();
                } catch (error) {
                    console.error(`[particle solana] reportParticle error`, error);
                    throw new Error('Failed to connect to Firefly');
                }

                try {
                    // update wallet state
                    await wallet.connect();
                } catch (error: unknown) {
                    throw new WalletConnectionError(formatError(error), error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: unknown) {
                throw new WalletPublicKeyError(formatError(error), error);
            }

            wallet.on('disconnect', this._disconnected);
            wallet.on('accountChanged', this._accountChanged);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', publicKey);
        } catch (error: unknown) {
            this.emit('error', error as WalletError);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const wallet = this._wallet;
        if (wallet) {
            try {
                wallet.off('disconnect', this._disconnected);
                wallet.off('accountChanged', this._accountChanged);

                this._wallet = null;
                this._publicKey = null;

                await wallet.disconnect();
            } catch (error: unknown) {
                this.emit('error', new WalletDisconnectionError(formatError(error), error));
            }
        }

        this.emit('disconnect');
    }

    override async sendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        connection: Connection,
        options: SendTransactionOptions = {},
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signers, ...sendOptions } = options;

                if (isVersionedTransaction(transaction)) {
                    signers?.length && transaction.sign(signers);
                } else {
                    transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
                    signers?.length && (transaction as Transaction).partialSign(...signers);
                }

                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                const { signature } = await wallet.signAndSendTransaction(transaction);
                return signature;
            } catch (error: unknown) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(formatError(error), error);
            }
        } catch (error: unknown) {
            this.emit('error', error as WalletError);
            throw error;
        }
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signTransaction(transaction)) || transaction;
            } catch (error: unknown) {
                throw new WalletSignTransactionError(formatError(error), error);
            }
        } catch (error: unknown) {
            this.emit('error', error as WalletError);
            throw error;
        }
    }

    override async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signAllTransactions(transactions)) || transactions;
            } catch (error: unknown) {
                throw new WalletSignTransactionError(formatError(error), error);
            }
        } catch (error: unknown) {
            this.emit('error', error as WalletError);
            throw error;
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signature } = await wallet.signMessage(message);
                return signature;
            } catch (error: unknown) {
                throw new WalletSignMessageError(formatError(error), error);
            }
        } catch (error: unknown) {
            this.emit('error', error as WalletError);
            throw error;
        }
    }

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);
            wallet.off('accountChanged', this._accountChanged);

            this._wallet = null;
            this._publicKey = null;

            this.emit('disconnect');
        }
    };

    private _accountChanged = (newPublicKey: PublicKey) => {
        const publicKey = this._publicKey;
        if (!publicKey) return;

        try {
            newPublicKey = new PublicKey(newPublicKey.toBytes());
        } catch (error: unknown) {
            this.emit('error', new WalletPublicKeyError(formatError(error), error));
            return;
        }

        if (publicKey.equals(newPublicKey)) return;

        this._publicKey = newPublicKey;
        this.emit('connect', newPublicKey);
    };
}
