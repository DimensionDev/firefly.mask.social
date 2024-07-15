import { isGreaterThan, isLessThan, rightShift } from '@masknet/web3-shared-base';
import {
    type Config,
    estimateGas,
    getBalance,
    sendTransaction,
    waitForTransactionReceipt,
    writeContract,
} from '@wagmi/core';
import { type Address, erc20Abi, type Hash, parseUnits } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { getTokenBalance } from '@/providers/evm/getTokenBalance.js';
import { isNativeToken } from '@/providers/evm/isNativeToken.js';
import { evmNetwork } from '@/providers/evm/Network.js';
import { type Token, type TransactionOptions, type Transfer } from '@/providers/types/Transfer.js';

const coreConfig = config as unknown as Config;

class EVMTransfer implements Transfer<Address, Hash> {
    async transfer(options: TransactionOptions): Promise<Address> {
        const { token } = options;
        if (token.chainId !== evmNetwork.getChainId()) {
            await evmNetwork.switchChain(token.chainId);
        }

        let hash: Address;
        if (this.isNativeToken(token)) {
            hash = await this.transferNative(options);
        } else {
            hash = await this.transferContract({ ...options, token });
        }

        await this.waitForTransaction(hash);
        return hash;
    }

    isNativeToken(token: Token): boolean {
        return isNativeToken(token);
    }

    async waitForTransaction(hash: Hash): Promise<void> {
        await waitForTransactionReceipt(coreConfig, { hash, chainId: evmNetwork.getChainId() });
    }

    async validateBalance({ token, amount }: TransactionOptions): Promise<boolean> {
        const balance = await getTokenBalance(token, await evmNetwork.getAccount(), token.chainId);

        return !isGreaterThan(rightShift(amount, token.decimals), `${balance.value}`);
    }

    async validateGas({ token, to }: TransactionOptions): Promise<boolean> {
        const account = await evmNetwork.getAccount();
        const nativeBalance = await getBalance(coreConfig, {
            address: account,
            chainId: token.chainId,
        });
        const gas = await estimateGas(coreConfig, {
            account,
            chainId: token.chainId,
            to,
        });

        return !isLessThan(`${nativeBalance.value}`, `${gas}`);
    }

    private async transferNative({ to, token, amount }: TransactionOptions): Promise<Address> {
        return sendTransaction(coreConfig, {
            account: await evmNetwork.getAccount(),
            to,
            value: parseUnits(amount, token.decimals),
        });
    }

    private async transferContract({ to, token, amount }: TransactionOptions): Promise<Address> {
        return writeContract(coreConfig, {
            address: token.id,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [to, parseUnits(amount, token.decimals)],
        });
    }
}

export const evmTransfer = new EVMTransfer();
