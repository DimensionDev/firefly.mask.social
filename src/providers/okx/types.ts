/** https://www.okx.com/web3/build/docs/waas/okx-waas-standard */
type OKXResponse<T> = {
    /**
     * the server returns string, but we will convert to number after request
     * to align to OKX private api
     */
    code: number;
    msg: string;
    data: T;
};

export interface ChainDex {
    /** API response string, we convert to number */
    chainId: number;
    chainName: string;
    /** would be empty string for non-ethereum chains */
    dexTokenApproveAddress: string;
}

export type SupportedChainResponse = OKXResponse<ChainDex[]>;
