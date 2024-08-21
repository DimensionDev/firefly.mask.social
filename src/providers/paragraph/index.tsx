import { getAccount, getTransactionConfirmations, http, readContract, writeContract } from '@wagmi/core';
import urlcat from 'urlcat';
import { createPublicClient, zeroAddress } from 'viem';
import { polygon } from 'viem/chains';

import { ParagraphABI, ParagraphMintABI } from '@/abis/Paragraph.js';
import { chains, config } from '@/configs/wagmiClient.js';
import { NotImplementedError } from '@/constants/error.js';
import { PARAGRAPH_COLLECT_FEE, PARAGRAPH_COLLECT_FEE_IN_POLYGON } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { rightShift } from '@/helpers/number.js';
import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import { resolveParagraphMintContract } from '@/helpers/resolveParagraphMintContract.js';
import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';
import type { ParagraphArticleDetail } from '@/providers/paragraph/type.js';
import type { Article, ArticleCollectDetail, Provider } from '@/providers/types/Article.js';

const MAX_SUPPLY = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

class Paragraph implements Provider {
    async discoverArticles(indicator?: PageIndicator): Promise<Pageable<Article, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getArticleById(articleId: string): Promise<Article | null> {
        throw new NotImplementedError();
    }

    async getFollowingArticles(indicator?: PageIndicator): Promise<Pageable<Article, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getArticleCollectDetail(digestLink: string): Promise<ArticleCollectDetail> {
        const response = await fetchJSON<{ data: ParagraphArticleDetail }>(
            urlcat(location.origin, '/api/paragraph', { link: digestLink }),
            {
                method: 'GET',
            },
        );

        const data = response.data;
        if (!data) throw new Error('Failed to fetch article detail');

        let isCollected = false;
        let soldCount = 0;

        const chainId = chains.find((x) => x.name.toLowerCase() === data.chain.toLowerCase())?.id;
        if (!chainId) throw new Error(`Unsupported chain: ${data.chain}`);

        if (data.contractAddress) {
            try {
                const account = getAccount(config);
                const balance = await readContract(config, {
                    abi: ParagraphABI,
                    address: data.contractAddress as `0x${string}`,
                    functionName: 'balanceOf',
                    args: [account.address],
                    chainId,
                });

                const totalSupply = await readContract(config, {
                    abi: ParagraphABI,
                    address: data.contractAddress as `0x${string}`,
                    functionName: 'totalSupply',
                    chainId,
                });

                if (totalSupply) {
                    soldCount = Number(totalSupply);
                }

                if (BigInt(balance as bigint) >= 1) {
                    isCollected = true;
                }
            } catch {
                isCollected = false;
                soldCount = 0;
            }
        }

        return {
            quantity: data.supply && data.supply !== MAX_SUPPLY ? Number(data.supply) : undefined,
            soldCount,
            chainId,
            contractAddress: data.contractAddress,
            isCollected,
            price: data.costEth ? Number(data.costEth) : null,
            fee: chainId !== polygon.id ? PARAGRAPH_COLLECT_FEE : PARAGRAPH_COLLECT_FEE_IN_POLYGON,
            symbol: data.symbol,
            name: data.text,
            ownerAddress: data.collectorWallet,
            referrerAddress: data.referrerAddress,
            postId: data.noteId,
            position: data.position,
        };
    }

    async estimateCollectGas(detail: ArticleCollectDetail) {
        const account = getAccount(config);
        const chain = chains.find((x) => x.id === detail.chainId);
        if (!chain) throw new Error('Unsupported chain');

        const client = createPublicClient({
            chain,
            transport: http(resolveRPCUrl(chain.id), { batch: true }),
        });

        const price = detail.price ? BigInt(rightShift(detail.price, chain.nativeCurrency.decimals).toString()) : 0n;

        const value = price + detail.fee;

        if (detail.contractAddress) {
            return client.estimateContractGas({
                address: detail.contractAddress as `0x${string}`,
                abi: ParagraphABI,
                functionName: 'mintWithReferrer',
                args: [account.address, detail.referrerAddress ?? zeroAddress],
                value,
            });
        }

        const address = resolveParagraphMintContract(detail.chainId);
        if (!address) throw new Error('UnSupport network');

        return client.estimateContractGas({
            address: address as `0x${string}`,
            abi: ParagraphMintABI,
            functionName: 'createAndMint',
            args: [
                [
                    detail.name,
                    detail.symbol,
                    detail.ownerAddress,
                    account.address,
                    detail.referrerAddress ?? zeroAddress,
                    BigInt(detail.quantity ?? MAX_SUPPLY),
                    BigInt(rightShift(detail.price ?? 0, chain.nativeCurrency.decimals).toString()),
                ],
                zeroAddress,
                detail.postId,
                detail.position?.from,
                detail.position?.to,
            ],
            value,
        });
    }

    async collect(detail: ArticleCollectDetail) {
        const account = getAccount(config);
        const chain = chains.find((x) => x.id === detail.chainId);
        if (!chain) throw new Error('UnSupport chain');

        const address = resolveParagraphMintContract(detail.chainId);
        if (!address) throw new Error('UnSupport network');
        const price = detail.price ? BigInt(rightShift(detail.price, chain.nativeCurrency.decimals).toString()) : 0n;
        const value = detail.fee + price;

        // factory contract has been deployed
        if (detail.contractAddress) {
            const hash = await writeContract(config, {
                address: detail.contractAddress as `0x${string}`,
                abi: ParagraphABI,
                functionName: 'mintWithReferrer',
                args: [account.address, detail.referrerAddress ?? zeroAddress],
                value,
            });

            return getTransactionConfirmations(config, { hash });
        }

        const hash = await writeContract(config, {
            address: address as `0x${string}`,
            abi: ParagraphMintABI,
            functionName: 'createAndMint',
            args: [
                [
                    detail.name,
                    detail.symbol,
                    detail.ownerAddress,
                    account,
                    detail.referrerAddress ?? zeroAddress,
                    BigInt(detail.quantity ?? MAX_SUPPLY),
                    price,
                ],
                zeroAddress,
                detail.postId,
                detail.position?.from,
                detail.position?.to,
            ],
            value,
        });

        return getTransactionConfirmations(config, { hash });
    }
}

export const ParagraphAPI = new Paragraph();
