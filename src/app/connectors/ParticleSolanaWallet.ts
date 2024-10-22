import { AuthType, connect } from '@particle-network/auth-core';
import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    isVersionedTransaction,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
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
    SendOptions,
    Transaction,
    TransactionSignature,
    TransactionVersion,
    VersionedTransaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

import { AuthenticationError } from '@/constants/error.js';
import { isValidSolanaAddress } from '@/helpers/isValidSolanaAddress.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';

interface ParticleSolanaWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
    accountChanged(newPublicKey: PublicKey): unknown;
}

interface ParticleSolanaWallet extends EventEmitter<ParticleSolanaWalletEvents> {
    isParticleNetwork?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(
        transaction: T,
        options?: SendOptions,
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface ParticleSolonaWindow extends Window {
    particle?: {
        solana?: ParticleSolanaWallet;
    };
    solana?: ParticleSolanaWallet;
}

declare const window: ParticleSolonaWindow;

export interface ParticleSolanaWalletAdapterConfig {}

export const ParticleSolanaWalletName = 'Firefly Wallet' as WalletName<'Firefly Wallet'>;

export class ParticleSolanaWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = ParticleSolanaWalletName;
    url = 'https://firefly.social/';
    icon = '/firefly.png';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _connecting: boolean;
    private _wallet: ParticleSolanaWallet | null;
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
            const wallet = window.particle?.solana || window.solana!;

            if (!wallet.isConnected) {
                if (!fireflySessionHolder.session) throw new AuthenticationError('Firefly session not found');

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
                    // update wallet state
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);
            wallet.on('accountChanged', this._accountChanged);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);
            wallet.off('accountChanged', this._accountChanged);

            this._wallet = null;
            this._publicKey = null;

            try {
                await wallet.disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
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

                const { signature } = await wallet.signAndSendTransaction(transaction, sendOptions);
                return signature;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signTransaction(transaction)) || transaction;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    override async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signAllTransactions(transactions)) || transactions;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
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
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
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

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };

    private _accountChanged = (newPublicKey: PublicKey) => {
        const publicKey = this._publicKey;
        if (!publicKey) return;

        try {
            newPublicKey = new PublicKey(newPublicKey.toBytes());
        } catch (error: any) {
            this.emit('error', new WalletPublicKeyError(error?.message, error));
            return;
        }

        if (publicKey.equals(newPublicKey)) return;

        this._publicKey = newPublicKey;
        this.emit('connect', newPublicKey);
    };
}
