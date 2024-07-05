import { EVMExplorerResolver } from '@masknet/web3-providers';
import { isGreaterThan, isLessThan, rightShift } from '@masknet/web3-shared-base';
import {
    type Config,
    estimateGas,
    getAccount,
    getBalance,
    getChainId,
    sendTransaction,
    switchChain,
    waitForTransactionReceipt,
    writeContract,
} from '@wagmi/core';
import { type Address, erc20Abi, parseUnits } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { getFixedConfig } from '@/providers/evm/getFixedConfig.js';
import { getTokenBalance } from '@/providers/evm/getTokenBalance.js';
import { isNativeToken } from '@/providers/evm/isNativeToken.js';
import { type Token, type Transfer, type TransferOptions } from '@/providers/types/Transfer.js';

class EVMTransfer implements Transfer<Config> {
    _config: Config;
    constructor(config: Config) {
        this._config = config;
    }

    async transfer(options: TransferOptions): Promise<Address> {
        const { token } = options;
        if (token.chainId !== this.getChainId()) {
            await this.switchChain(token.chainId);
        }

        let hash: Address;
        if (this.isNativeToken(token)) {
            hash = await this._transferNative(options);
        } else {
            hash = await this._transferContract({ ...options, token });
        }

        await this.waitForTransaction(hash);
        return hash;
    }

    async connect(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    isNativeToken(token: Token): boolean {
        return isNativeToken(token);
    }

    async waitForTransaction(hash: Address): Promise<void> {
        await waitForTransactionReceipt(this._config, { hash });
    }

    async validateBalance({ token, amount }: TransferOptions): Promise<boolean> {
        const balance = await getTokenBalance(token, await this.getAccount(), token.chainId);

        return !isGreaterThan(rightShift(amount, token.decimals), `${balance.value}`);
    }

    async validateGas({ token, to }: TransferOptions): Promise<boolean> {
        const account = await this.getAccount();
        const nativeBalance = await getBalance(getFixedConfig(), {
            address: account,
            chainId: token.chainId,
        });
        const gas = await estimateGas(getFixedConfig(), {
            account,
            chainId: token.chainId,
            to,
        });

        return !isLessThan(`${nativeBalance.value}`, `${gas}`);
    }

    async getAccount(): Promise<Address> {
        const account = getAccount(this._config);
        if (!account.address) {
            throw new Error('Wallet not connected');
        }
        return account.address;
    }

    async switchChain(chainId: number): Promise<void> {
        await switchChain(this._config, { chainId });
    }

    getChainId(): number {
        return getChainId(this._config);
    }

    getAddressUrl(chainId: number, address: Address): string | undefined {
        return EVMExplorerResolver.addressLink(chainId, address);
    }

    getTransactionUrl(chainId: number, hash: Address): string | undefined {
        return EVMExplorerResolver.transactionLink(chainId, hash);
    }

    async _transferNative({ to, token, amount }: TransferOptions): Promise<Address> {
        return sendTransaction(this._config, {
            account: await this.getAccount(),
            to,
            value: parseUnits(amount, token.decimals),
        });
    }

    async _transferContract({ to, token, amount }: TransferOptions): Promise<Address> {
        return writeContract(this._config, {
            address: token.id,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [to, parseUnits(amount, token.decimals)],
        });
    }
}

export const evmTransfer = new EVMTransfer(config as unknown as Config);
