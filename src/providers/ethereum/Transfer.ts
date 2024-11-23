import type { ChainId } from '@masknet/web3-shared-evm';
import { getBalance, sendTransaction, writeContract } from '@wagmi/core';
import { BigNumber } from 'bignumber.js';
import { type Address, type Hash, parseUnits } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { getTokenAbiForWagmi } from '@/helpers/getTokenAbiForWagmi.js';
import { isGreaterThan, isLessThan, isZero, leftShift, multipliedBy, rightShift } from '@/helpers/number.js';
import { switchEthereumChain } from '@/helpers/switchEthereumChain.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { getAvailableBalance } from '@/providers/ethereum/getAvailableBalance.js';
import { getDefaultGas } from '@/providers/ethereum/getDefaultGas.js';
import { isNativeToken } from '@/providers/ethereum/isNativeToken.js';
import { EthereumNetwork } from '@/providers/ethereum/Network.js';
import { type Token, type TransactionOptions, type TransferProvider } from '@/providers/types/Transfer.js';

class Provider implements TransferProvider<ChainId, Address, Hash> {
    async transfer(options: TransactionOptions<ChainId, Address>): Promise<Address> {
        const { token } = options;
        if (token.chainId !== EthereumNetwork.getChainId()) {
            await switchEthereumChain(token.chainId);
        }

        const hash = this.isNativeToken(token)
            ? await this.transferNative(options)
            : await this.transferContract({ ...options, token });

        await waitForEthereumTransaction(options.token.chainId, hash);
        return hash;
    }

    isNativeToken(token: Token): boolean {
        return isNativeToken(token);
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
        const { gas } = await getDefaultGas(options);

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

    private async transferNative(options: TransactionOptions<ChainId, Address>): Promise<Address> {
        const { isEIP1559, gasPrice, maxFeePerGas } = await getDefaultGas(options);
        const gas = multipliedBy((this.isNativeToken(options.token) ? 21000n : 50000n).toString(), '1.1').toFixed(0);

        const parameters = {
            chainId: options.token.chainId,
            account: await EthereumNetwork.getAccount(),
            to: options.to,
            value: parseUnits(options.amount, options.token.decimals),
            gas: BigInt(gas),
        } as const;

        if (isEIP1559) {
            return sendTransaction(config, {
                ...parameters,
                type: 'eip1559',
                maxFeePerGas,
            });
        }
        return sendTransaction(config, {
            ...parameters,
            type: 'legacy',
            gasPrice,
        });
    }

    private async transferContract(options: TransactionOptions<ChainId, Address>): Promise<Address> {
        const { isEIP1559, gasPrice, maxFeePerGas } = await getDefaultGas(options);
        const gas = multipliedBy((this.isNativeToken(options.token) ? 21000n : 50000n).toString(), '1.5').toFixed(0);

        const parameters = {
            chainId: options.token.chainId,
            address: options.token.id,
            abi: getTokenAbiForWagmi(options.token.chainId, options.token.id),
            functionName: 'transfer',
            args: [options.to, parseUnits(options.amount, options.token.decimals)],
            gas: BigInt(gas),
        } as const;

        if (isEIP1559) {
            return writeContract(config, {
                ...parameters,
                type: 'eip1559',
                maxFeePerGas,
            });
        }
        return writeContract(config, {
            ...parameters,
            type: 'legacy',
            gasPrice,
        });
    }
}

export const EthereumTransfer = new Provider();
