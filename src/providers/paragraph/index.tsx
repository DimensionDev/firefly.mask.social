import { getAccount, http, readContract, writeContract } from '@wagmi/core';
import urlcat from 'urlcat';
import { createPublicClient, zeroAddress } from 'viem';
import { polygon } from 'viem/chains';

import { ParagraphABI, ParagraphMintABI } from '@/abis/Paragraph.js';
import { chains, config } from '@/configs/wagmiClient.js';
import { PARAGRAPH_COLLECT_FEE, PARAGRAPH_COLLECT_FEE_IN_POLYGON } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { rightShift } from '@/helpers/number.js';
import { resolveParagraphMintContract } from '@/helpers/resolveParagraphMintContract.js';
import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';
import type { ParagraphArticleDetail } from '@/providers/paragraph/type.js';
import type { ArticleCollectDetail } from '@/providers/types/Article.js';

class Paragraph {
    async getArticleDetail(digestLink: string): Promise<ArticleCollectDetail> {
        const response = await fetchJSON<ParagraphArticleDetail>(
            urlcat(location.origin, '/api/paragraph', { link: digestLink }),
            {
                method: 'GET',
            },
        );

        let isCollected = false;
        let soldNum = 0;

        const chainId = chains.find((x) => x.name.toLowerCase() === response.chain.toLowerCase())?.id;

        if (!chainId) throw new Error('Unsupport chain');
        if (response.contractAddress) {
            try {
                const account = getAccount(config);
                const balance = await readContract(config, {
                    abi: ParagraphABI,
                    address: response.contractAddress as `0x${string}`,
                    functionName: 'balanceOf',
                    args: [account.address],
                    chainId,
                });

                const totalSupply = await readContract(config, {
                    abi: ParagraphABI,
                    address: response.contractAddress as `0x${string}`,
                    functionName: 'totalSupply',
                    chainId,
                });

                if (totalSupply) {
                    soldNum = Number(totalSupply);
                }

                if (BigInt(balance as bigint) >= 1) {
                    isCollected = true;
                }
            } catch {
                isCollected = false;
                soldNum = 0;
            }
        }

        return {
            quantity: Number(response.supply),
            soldNum,
            chainId,
            contractAddress: response.contractAddress,
            isCollected,
            price: response.costEth ? Number(response.costEth) : null,
            fee: chainId !== polygon.id ? PARAGRAPH_COLLECT_FEE : PARAGRAPH_COLLECT_FEE_IN_POLYGON,
            symbol: response.symbol,
            name: response.text,
            onwerAddress: response.collectorWallet,
            referrerAddress: response.referrerAddress,
            postId: response.noteId,
            position: response.position,
        };
    }

    async estimateCollectGas(detail: ArticleCollectDetail, account: string) {
        const chain = chains.find((x) => x.id === detail.chainId);
        if (!chain) throw new Error('Unsupported chain');

        const client = createPublicClient({
            chain,
            transport: http(resolveRPCUrl(chain.id), { batch: true }),
        });

        const address = resolveParagraphMintContract(detail.chainId);
        if (!address) throw new Error('Unsupport netowrk');

        return client.estimateContractGas({
            address: address as `0x${string}`,
            abi: ParagraphMintABI,
            functionName: 'createAndMint',
            args: [
                [
                    detail.name,
                    detail.symbol,
                    detail.onwerAddress,
                    account,
                    detail.referrerAddress ?? zeroAddress,
                    BigInt(detail.quantity),
                    BigInt(rightShift(detail.price ?? 0, 18).toString()),
                ],
                zeroAddress,
                detail.postId,
                detail.position?.from,
                detail.position?.to,
            ],
        });
    }

    async collect(detail: ArticleCollectDetail, account: string) {
        const chain = chains.find((x) => x.id === detail.chainId);
        if (!chain) throw new Error('Unsupported chain');

        const address = resolveParagraphMintContract(detail.chainId);
        if (!address) throw new Error('Unsupport netowrk');
        return writeContract(config, {
            address: address as `0x${string}`,
            abi: ParagraphMintABI,
            functionName: 'createAndMint',
            args: [
                [
                    detail.name,
                    detail.symbol,
                    detail.onwerAddress,
                    account,
                    detail.referrerAddress ?? zeroAddress,
                    BigInt(detail.quantity),
                    BigInt(rightShift(detail.price ?? 0, 18).toString()),
                ],
                zeroAddress,
                detail.postId,
                detail.position?.from,
                detail.position?.to,
            ],
            value: detail.fee,
        });
    }
}

export const ParagraphAPI = new Paragraph();
