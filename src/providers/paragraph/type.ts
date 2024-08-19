export interface ParagraphArticleDetail {
    chain: string;
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
