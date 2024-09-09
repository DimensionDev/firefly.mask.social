export interface ParagraphArticleDetail {
    chain: ParagraphChain;
    noteId: string;
    supply: string;
    costEth: string;
    position: {
        from: number;
        to: number;
    };
    contractAddress: string;
    text: string;
    symbol: string;
    referrerAddress?: string;
    collectorWallet: string;
}

export enum ParagraphChain {
    Optimism = 'optimism',
    Base = 'base',
    Zora = 'zora',
    Polygon = 'polygon',
}
