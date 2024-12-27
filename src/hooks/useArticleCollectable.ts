import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { estimateFeesPerGas, getBalance } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { MintStatus } from '@/constants/enum.js';
import { getArticleDigest } from '@/helpers/getArticleDigest.js';
import { multipliedBy, rightShift, ZERO } from '@/helpers/number.js';
import { resolveArticleCollectProvider } from '@/helpers/resolveArticleCollectProvider.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { type Article } from '@/providers/types/Article.js';
import type { MintMetadata } from '@/providers/types/Firefly.js';

function createDefaultMintData(mintPrice: string, platformFee: string, chainId: number): MintMetadata {
    return {
        mintStatus: MintStatus.MintAgain,
        mintPrice,
        platformFee,
        txData: {
            gasLimit: '',
            inputData: '',
            to: '',
            value: '',
        },
        mintCount: 1,
        perLimitCount: 1,
        chainId,
        gasStatus: false,
        tokenPrice: '',
        nativePrice: 0,
    };
}

export function useArticleCollectable(article: Article, queryKey: Array<string | undefined>) {
    const account = useAccount();

    return useQuery({
        queryKey,
        queryFn: async () => {
            const digest = getArticleDigest(article);
            if (!digest) return null;
            const provider = resolveArticleCollectProvider(article.platform);
            if (!provider) return null;

            const data = await provider.getArticleCollectableByDigest(digest);

            if (!account.address)
                return {
                    data,
                    insufficientBalance: true,
                };

            try {
                const isEIP1559 = EVMChainResolver.isFeatureSupported(data.chainId, 'EIP1559');
                const { gasPrice, maxFeePerGas } = await estimateFeesPerGas(config, {
                    chainId: data.chainId,
                    type: isEIP1559 ? 'eip1559' : 'legacy',
                });

                const gasLimit = await provider.estimateCollectGas(data);

                const balance = await getBalance(config, {
                    address: account.address,
                    chainId: data.chainId,
                });

                const gasFee = isEIP1559
                    ? !maxFeePerGas
                        ? ZERO
                        : multipliedBy(maxFeePerGas.toString(), gasLimit.toString())
                    : !gasPrice
                      ? ZERO
                      : multipliedBy(gasPrice.toString(), gasLimit.toString());
                const price = data.price ? BigInt(rightShift(data.price, 18).toString()) : 0n;

                const cost = price + data.fee + BigInt(gasFee.toString());

                return {
                    data,
                    isFree: true,
                    gasFee: gasFee.toString(),
                    totalCost: cost.toString(),
                    mintMetadata: createDefaultMintData(price.toString(), data.fee.toString() || '0', data.chainId),
                    insufficientBalance: cost > balance.value,
                };
            } catch {
                return {
                    data,
                    isFree: true,
                    gasFee: '',
                    totalCost: '',
                    mintMetadata: createDefaultMintData('', '', data.chainId),
                    insufficientBalance: true,
                };
            }
        },
    });
}

export function useArticleCollectStatus(article: Article) {
    const account = useAccount();

    return useQuery({
        queryKey: ['article-collect-status', article.platform, article.id],
        queryFn: async () => {
            try {
                if (!account.address) return;
                return FireflyEndpointProvider.getArticleCollectStatus(article.id, account.address, article.platform);
            } catch {
                return;
            }
        },
    });
}
