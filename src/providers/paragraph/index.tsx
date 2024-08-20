import { getAccount, getTransactionConfirmations, http, readContract, writeContract } from '@wagmi/core';
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
import type { ArticleCollectDetail, ArticleCollectProvider } from '@/providers/types/Article.js';

const MAX_SUPPLY = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

class Paragraph implements ArticleCollectProvider {
    async getArticleDetail(digestLink: string): Promise<ArticleCollectDetail> {
        const response = await fetchJSON<{ data: ParagraphArticleDetail }>(
            urlcat(location.origin, '/api/paragraph', { link: digestLink }),
            {
                method: 'GET',
            },
        );

        const data = response.data;

        if (!data) throw new Error('Failed to fetch article detail');

        let isCollected = false;
        let soldNum = 0;

        const chainId = chains.find((x) => x.name.toLowerCase() === data.chain.toLowerCase())?.id;

        if (!chainId) throw new Error('Unsupport chain');
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
            quantity: data.supply && data.supply !== MAX_SUPPLY ? Number(data.supply) : undefined,
            soldNum,
            chainId,
            contractAddress: data.contractAddress,
            isCollected,
            price: data.costEth ? Number(data.costEth) : null,
            fee: chainId !== polygon.id ? PARAGRAPH_COLLECT_FEE : PARAGRAPH_COLLECT_FEE_IN_POLYGON,
            symbol: data.symbol,
            name: data.text,
            onwerAddress: data.collectorWallet,
            referrerAddress: data.referrerAddress,
            postId: data.noteId,
            position: data.position,
        };
    }

    async estimateCollectGas(detail: ArticleCollectDetail, account: string) {
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
                args: [account, detail.referrerAddress ?? zeroAddress],
                value,
            });
        }

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

    async collect(detail: ArticleCollectDetail, account: string) {
        const chain = chains.find((x) => x.id === detail.chainId);
        if (!chain) throw new Error('Unsupported chain');

        const address = resolveParagraphMintContract(detail.chainId);
        if (!address) throw new Error('Unsupport netowrk');
        const price = detail.price ? BigInt(rightShift(detail.price, chain.nativeCurrency.decimals).toString()) : 0n;
        const value = detail.fee + price;

        // factory contract has been deployed
        if (detail.contractAddress) {
            const hash = await writeContract(config, {
                address: detail.contractAddress as `0x${string}`,
                abi: ParagraphABI,
                functionName: 'mintWithReferrer',
                args: [account, detail.referrerAddress ?? zeroAddress],
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
                    detail.onwerAddress,
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
