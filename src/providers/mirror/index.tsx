import { getAccount, getTransactionConfirmations, readContract, writeContract } from '@wagmi/core';
import urlcat from 'urlcat';
import { createPublicClient, http, zeroAddress } from 'viem';
import { polygon } from 'viem/chains';

import { MirrorABI } from '@/abis/Mirror.js';
import { chains, config } from '@/configs/wagmiClient.js';
import { MIRROR_COLLECT_FEE, MIRROR_COLLECT_FEE_IN_POLYGON } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { rightShift } from '@/helpers/number.js';
import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';
import { WritingNFTQuery } from '@/providers/mirror/query.js';
import { type MirrorArticleDetail } from '@/providers/mirror/type.js';
import type { ArticleCollectDetail, ArticleCollectProvider } from '@/providers/types/Article.js';

class Mirror implements ArticleCollectProvider {
    async getArticleDetail(digest: string): Promise<ArticleCollectDetail> {
        const response = await fetchJSON<MirrorArticleDetail>(urlcat(location.origin, '/api/mirror'), {
            method: 'POST',
            body: JSON.stringify({
                ...WritingNFTQuery,
                variables: {
                    digest,
                },
            }),
        });

        const result = response.data.data.entry.writingNFT;

        let isCollected = false;

        if (result.proxyAddress) {
            try {
                const account = getAccount(config);
                const balance = await readContract(config, {
                    abi: MirrorABI,
                    address: result.proxyAddress as `0x${string}`,
                    functionName: 'balanceOf',
                    args: [account.address],
                    chainId: result.network.chainId,
                });

                if (BigInt(balance as bigint) >= 1) {
                    isCollected = true;
                }
            } catch {
                isCollected = false;
            }
        }

        return {
            quantity: result.quantity,
            soldNum: result.optimisticNumSold,
            chainId: result.network.chainId,
            contractAddress: result.proxyAddress ?? result.factoryAddress,
            isCollected,
            price: result.price,

            fee: result.network.chainId !== polygon.id ? MIRROR_COLLECT_FEE : MIRROR_COLLECT_FEE_IN_POLYGON,
        };
    }

    async estimateCollectGas(detail: ArticleCollectDetail, account: string) {
        const chain = chains.find((x) => x.id === detail.chainId);
        if (!chain) throw new Error('Unsupported chain');

        const client = createPublicClient({
            chain,
            transport: http(resolveRPCUrl(chain.id), { batch: true }),
        });

        const price = detail.price ? BigInt(rightShift(detail.price, 18).toString()) : 0n;

        return client.estimateContractGas({
            address: detail.contractAddress as `0x${string}`,
            abi: MirrorABI,
            functionName: 'purchase',
            args: [account, '', zeroAddress],
            value: detail.fee + price,
        });
    }

    async collect(detail: ArticleCollectDetail, account: string) {
        const price = detail.price ? BigInt(rightShift(detail.price, 18).toString()) : 0n;

        const hash = await writeContract(config, {
            abi: MirrorABI,
            address: detail.contractAddress as `0x${string}`,
            functionName: 'purchase',
            args: [account, '', zeroAddress],
            value: detail.fee + price,
        });

        return getTransactionConfirmations(config, {
            hash,
        });
    }
}

export const MirrorAPI = new Mirror();
