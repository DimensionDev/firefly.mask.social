import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { estimateFeesPerGas, getBalance } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { getArticleDigest } from '@/helpers/getArticleDigest.js';
import { multipliedBy, rightShift, ZERO } from '@/helpers/number.js';
import { resolveArticleCollectProvider } from '@/helpers/resolveArticleCollectProvider.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import { type Article } from '@/providers/types/Article.js';

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
                    insufficientBalance: cost > balance.value,
                };
            } catch {
                return {
                    data,
                    isFree: true,
                    gasFee: '',
                    totalCost: '',
                    insufficientBalance: true,
                };
            }
        },
    });
}
