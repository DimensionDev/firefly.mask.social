export interface MirrorArticleDetail {
    data: {
        data: {
            entry: {
                writingNFT: {
                    deploymentSignature: string;
                    imageURI: string;
                    contentURI: string;
                    title: string;
                    description: string;
                    owner: string;
                    nonce: number;
                    symbol: string;
                    renderer: string;
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
