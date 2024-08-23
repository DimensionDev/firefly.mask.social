export interface MirrorArticleDetail {
    data: {
        data: {
            entry: {
                writingNFT: {
                    canMint: boolean;
                    optimisticNumSold: number;
                    price: number | null;
                    factoryAddress: string;
                    proxyAddress: string | null;
                    quantity: number;
                    network: {
                        chainId: number;
                    };
                };
            };
        };
    };
}
