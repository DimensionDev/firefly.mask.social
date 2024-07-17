import { isGreaterThan, isLessThan, leftShift, rightShift } from '@masknet/web3-shared-base';
import type { ChainId } from '@masknet/web3-shared-evm';
import { getBalance, sendTransaction, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { BigNumber } from 'bignumber.js';
import { type Address, erc20Abi, type Hash, parseUnits } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { isZero } from '@/helpers/number.js';
import { getAvailableBalance } from '@/providers/ethereum/getAvailableBalance.js';
import { getDefaultGas } from '@/providers/ethereum/getDefaultGas.js';
import { isNativeToken } from '@/providers/ethereum/isNativeToken.js';
import { EthereumNetwork } from '@/providers/ethereum/Network.js';
import { type Token, type TransactionOptions, type TransferProvider } from '@/providers/types/Transfer.js';

class Provider implements TransferProvider<ChainId, Address, Hash> {
    async transfer(options: TransactionOptions<ChainId, Address>): Promise<Address> {
        const { token } = options;
        if (token.chainId !== EthereumNetwork.getChainId()) {
            await EthereumNetwork.switchChain(token.chainId);
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
        await waitForTransactionReceipt(config, { hash, chainId: EthereumNetwork.getChainId() });
    }

    async validateBalance(options: TransactionOptions<ChainId, Address>): Promise<boolean> {
        const balance = await getAvailableBalance(options);

        return !isGreaterThan(rightShift(options.amount, options.token.decimals), balance);
    }

    async validateGas(options: TransactionOptions<ChainId, Address>): Promise<boolean> {
        const { token } = options;
        const account = await EthereumNetwork.getAccount();
        const nativeBalance = await getBalance(config, {
            address: account,
            chainId: token.chainId,
        });
        const gas = await getDefaultGas(options);

        return !isLessThan(`${nativeBalance.value}`, `${gas}`);
    }

    async getAvailableBalance(options: TransactionOptions<ChainId, Address>): Promise<string> {
        const { token } = options;
        const balance = await getAvailableBalance(options);
        const formattedBalance = formatBalance(balance, token.decimals, {
            significant: 4,
            isPrecise: true,
            hasSeparators: false,
        });

        return (
            (isZero(formattedBalance)
                ? new BigNumber(leftShift(balance, token.decimals).toPrecision(2)).toFormat()
                : formattedBalance) ?? '0'
        );
    }

    private async transferNative({ to, token, amount }: TransactionOptions<ChainId, Address>): Promise<Address> {
        return sendTransaction(config, {
            account: await EthereumNetwork.getAccount(),
            to,
            value: parseUnits(amount, token.decimals),
        });
    }

    private async transferContract({ to, token, amount }: TransactionOptions<ChainId, Address>): Promise<Address> {
        return writeContract(config, {
            address: token.id,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [to, parseUnits(amount, token.decimals)],
        });
    }
}

export const EthereumTransfer = new Provider();
