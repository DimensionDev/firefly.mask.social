import { getAccount, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import urlcat from 'urlcat';
import { createPublicClient, http, parseSignature, zeroAddress, type Address } from 'viem';
import { polygon } from 'viem/chains';

import { MirrorABI, MirrorFactoryABI, OldMirrorABI } from '@/abis/Mirror.js';
import { chains, config } from '@/configs/wagmiClient.js';
import { NotImplementedError } from '@/constants/error.js';
import { MIRROR_COLLECT_FEE, MIRROR_COLLECT_FEE_IN_POLYGON, MIRROR_OLD_FACTOR_ADDRESSES } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { rightShift } from '@/helpers/number.js';
import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';
import { WritingNFTQuery } from '@/providers/mirror/query.js';
import { type MirrorArticleDetail } from '@/providers/mirror/type.js';
import type { Article, ArticleCollectable, Provider } from '@/providers/types/Article.js';

class Mirror implements Provider {
    async discoverArticles(indicator?: PageIndicator): Promise<Pageable<Article, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getArticleById(articleId: string): Promise<Article | null> {
        throw new NotImplementedError();
    }

    async getFollowingArticles(indicator?: PageIndicator): Promise<Pageable<Article, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getArticleCollectableByDigest(digest: string): Promise<ArticleCollectable> {
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
                    address: result.proxyAddress as Address,
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
            soldCount: result.optimisticNumSold,
            chainId: result.network.chainId,
            contractAddress: result.proxyAddress ?? result.factoryAddress,
            isCollected,
            price: result.price,
            factorAddress: result.factoryAddress,
            nonce: result.nonce,
            renderer: result.renderer,
            symbol: result.symbol,
            description: result.description,
            title: result.title,
            imageURI: result.imageURI,
            contentURI: result.contentURI,
            deploymentSignature: result.deploymentSignature,
            owner: result.owner,
            fee: result.network.chainId !== polygon.id ? MIRROR_COLLECT_FEE : MIRROR_COLLECT_FEE_IN_POLYGON,
        };
    }

    async estimateCollectGas(article: ArticleCollectable) {
        const account = getAccount(config);
        const chain = chains.find((x) => x.id === article.chainId);
        if (!chain) throw new Error('Unsupported chain');

        const client = createPublicClient({
            chain,
            transport: http(resolveRPCUrl(chain.id), { batch: true }),
        });

        const price = article.price ? BigInt(rightShift(article.price, 18).toString()) : 0n;

        if (isSameEthereumAddress(article.contractAddress, article.factorAddress) && article.deploymentSignature) {
            const { r, s, v } = parseSignature(article.deploymentSignature as Address);
            return client.estimateContractGas({
                address: article.factorAddress as Address,
                abi: MirrorFactoryABI,
                functionName: 'createWithSignature',
                args: [
                    article.owner,
                    [
                        article.title,
                        article.symbol,
                        article.description,
                        article.imageURI,
                        article.contentURI,
                        price,
                        article.quantity,
                        account.address,
                        article.renderer,
                        article.nonce,
                    ],
                    v,
                    r,
                    s,
                    account.address,
                    '',
                    zeroAddress,
                ],
                value: article.fee + price,
            });
        }

        const isOld = MIRROR_OLD_FACTOR_ADDRESSES.some((x) => isSameEthereumAddress(x, article.factorAddress));
        const ABI = isOld ? OldMirrorABI : MirrorABI;

        return client.estimateContractGas({
            address: article.contractAddress as Address,
            abi: ABI,
            functionName: 'purchase',
            args: isOld ? [account.address, ''] : [account.address, '', zeroAddress],
            value: article.fee + price,
        });
    }

    async collect(article: ArticleCollectable) {
        const account = getAccount(config);
        const price = article.price ? BigInt(rightShift(article.price, 18).toString()) : 0n;

        if (isSameEthereumAddress(article.contractAddress, article.factorAddress) && article.deploymentSignature) {
            const { r, s, v } = parseSignature(article.deploymentSignature as Address);
            const hash = await writeContract(config, {
                address: article.factorAddress as Address,
                abi: MirrorFactoryABI,
                functionName: 'createWithSignature',
                args: [
                    article.owner,
                    [
                        article.title,
                        article.symbol,
                        article.description,
                        article.imageURI,
                        article.contentURI,
                        price,
                        article.quantity,
                        account.address,
                        article.renderer,
                        article.nonce,
                    ],
                    v,
                    r,
                    s,
                    account.address,
                    '',
                    zeroAddress,
                ],
                value: article.fee + price,
            });

            return waitForTransactionReceipt(config, {
                hash,
            });
        }

        const isOld = MIRROR_OLD_FACTOR_ADDRESSES.some((x) => isSameEthereumAddress(x, article.factorAddress));
        const ABI = isOld ? OldMirrorABI : MirrorABI;

        const hash = await writeContract(config, {
            abi: ABI,
            address: article.contractAddress as Address,
            functionName: 'purchase',
            args: isOld ? [account.address, ''] : [account.address, '', zeroAddress],
            value: article.fee + price,
        });

        return waitForTransactionReceipt(config, {
            hash,
        });
    }
}

export const MirrorAPI = new Mirror();
