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

export interface ParagraphJSONContent {
    type: string;
    attrs?: {
        tweetData?: {
            video?: {
                poster: string;
                variants: Array<{ type: string; src: string }>;
            };
        };
    };
    content: Array<{
        attrs?: {
            nextheight?: number;
            nextwidth?: number;
            src: string;
        };
    }>;
}
