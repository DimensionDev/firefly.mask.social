export interface MirrorArticleDetail {
    data: {
        data: {
            entry: {
                writingNFT: {
                    depolymentSignature: string;
                    imageURI: string;
                    contentURI: string;
                    title: string;
                    description: string;
                    owner: string;
                    nonce: number;
                    symbol: string;
                    renderer: string;
                    deploymentSignature: string;
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
