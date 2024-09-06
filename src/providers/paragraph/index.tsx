import { getAccount, getTransactionConfirmations, http, readContract, writeContract } from '@wagmi/core';
import urlcat from 'urlcat';
import { createPublicClient, zeroAddress } from 'viem';
import { base, optimism, polygon, zora } from 'viem/chains';

import { ParagraphABI, ParagraphMintABI } from '@/abis/Paragraph.js';
import { chains, config } from '@/configs/wagmiClient.js';
import { NotImplementedError, UnreachableError } from '@/constants/error.js';
import { PARAGRAPH_COLLECT_FEE, PARAGRAPH_COLLECT_FEE_IN_POLYGON } from '@/constants/index.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { rightShift } from '@/helpers/number.js';
import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import { resolveParagraphMintContract } from '@/helpers/resolveParagraphMintContract.js';
import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';
import { type ParagraphArticleDetail, ParagraphChain } from '@/providers/paragraph/type.js';
import type { Article, ArticleCollectable, Provider } from '@/providers/types/Article.js';

const MAX_SUPPLY = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

const resolveParagraphChain = createLookupTableResolver<ParagraphChain, number>(
    {
        [ParagraphChain.Optimism]: optimism.id,
        [ParagraphChain.Polygon]: polygon.id,
        [ParagraphChain.Base]: base.id,
        [ParagraphChain.Zora]: zora.id,
    },
    (chain: ParagraphChain) => {
        throw new UnreachableError('chain', chain);
    },
);

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

    async getArticleCollectableByDigest(digestLink: string): Promise<ArticleCollectable> {
        const response = await fetchJSON<{ data: ParagraphArticleDetail }>(
            urlcat(location.origin, '/api/paragraph', { link: digestLink }),
            {
                method: 'GET',
            },
        );

        const data = response.data;
        if (!data) throw new Error('Failed to fetch article detail.');

        let isCollected = false;
        let soldCount = 0;

        const chainId = resolveParagraphChain(data.chain);
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

    async estimateCollectGas(article: ArticleCollectable) {
        const account = getAccount(config);
        const chain = chains.find((x) => x.id === article.chainId);
        if (!chain) throw new Error(`Unsupported chain: ${article.chainId}`);

        const client = createPublicClient({
            chain,
            transport: http(resolveRPCUrl(chain.id), { batch: true }),
        });

        const price = article.price ? BigInt(rightShift(article.price, chain.nativeCurrency.decimals).toString()) : 0n;

        const value = price + article.fee;

        if (article.contractAddress) {
            return client.estimateContractGas({
                address: article.contractAddress as `0x${string}`,
                abi: ParagraphABI,
                functionName: 'mintWithReferrer',
                args: [account.address, article.referrerAddress ?? zeroAddress],
                value,
            });
        }

        const address = resolveParagraphMintContract(article.chainId);
        if (!address) throw new Error(`Unsupported network: ${article.chainId}`);

        return client.estimateContractGas({
            address: address as `0x${string}`,
            abi: ParagraphMintABI,
            functionName: 'createAndMint',
            args: [
                [
                    article.name,
                    article.symbol,
                    article.ownerAddress,
                    account.address,
                    article.referrerAddress ?? zeroAddress,
                    BigInt(article.quantity ?? MAX_SUPPLY),
                    BigInt(rightShift(article.price ?? 0, chain.nativeCurrency.decimals).toString()),
                ],
                zeroAddress,
                article.postId,
                article.position?.from,
                article.position?.to,
            ],
            value,
        });
    }

    async collect(article: ArticleCollectable) {
        const account = getAccount(config);
        const chain = chains.find((x) => x.id === article.chainId);
        if (!chain) throw new Error(`Unsupported chain: ${article.chainId}`);

        const address = resolveParagraphMintContract(article.chainId);
        if (!address) throw new Error(`Unsupported network: ${article.chainId}`);

        const price = article.price ? BigInt(rightShift(article.price, chain.nativeCurrency.decimals).toString()) : 0n;
        const value = article.fee + price;

        // factory contract has been deployed
        if (article.contractAddress) {
            const hash = await writeContract(config, {
                address: article.contractAddress as `0x${string}`,
                abi: ParagraphABI,
                functionName: 'mintWithReferrer',
                args: [account.address, article.referrerAddress ?? zeroAddress],
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
                    article.name,
                    article.symbol,
                    article.ownerAddress,
                    account.address,
                    article.referrerAddress ?? zeroAddress,
                    BigInt(article.quantity ?? MAX_SUPPLY),
                    price,
                ],
                zeroAddress,
                article.postId,
                article.position?.from,
                article.position?.to,
            ],
            value,
        });

        return getTransactionConfirmations(config, { hash });
    }
}

export const ParagraphAPI = new Paragraph();
