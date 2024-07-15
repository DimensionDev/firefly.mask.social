import type { ChainId } from '@masknet/web3-shared-solana';
import { isNativeTokenAddress } from '@masknet/web3-shared-solana';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { requestRPC } from '@/providers/solana/requestRPC.js';
import type { GetBalanceResponse, GetProgramAccountsResponse } from '@/providers/types/Solana.js';
import type { Token } from '@/providers/types/Transfer.js';

export async function getNativeTokenBalance(address: string, chainId: number) {
    const data = await requestRPC<GetBalanceResponse>(chainId, {
        method: 'getBalance',
        params: [address],
    });
    return { value: data.result?.value.toString() ?? '0' };
}

export async function getSplTokenBalance(tokenAddress: string, address: string, chainId: number) {
    const programs = await requestRPC<GetProgramAccountsResponse>(chainId, {
        method: 'getProgramAccounts',
        params: [
            TOKEN_PROGRAM_ID.toBase58(),
            {
                encoding: 'jsonParsed',
                filters: [
                    {
                        dataSize: 165,
                    },
                    {
                        memcmp: {
                            offset: 32,
                            bytes: address,
                        },
                    },
                ],
            },
        ],
    });

    const tokenProgram = programs.result?.find((program) => {
        const account = program.account.data.parsed.info;
        if (account.tokenAmount.decimals === 0) return false;
        return account.mint === tokenAddress;
    });

    if (!tokenProgram) {
        return { value: '0' };
    }

    const tokenInfo = tokenProgram.account.data.parsed.info.tokenAmount;

    return { value: tokenInfo.amount };
}

export async function getTokenBalance(token: Token<ChainId>, address: string, chainId: number) {
    return isNativeTokenAddress(token.id)
        ? await getNativeTokenBalance(address, chainId)
        : await getSplTokenBalance(token.id, address, chainId);
}
