interface RpcResponse<T> {
    jsonrpc: '2.0';
    result: T | null;
}

interface ProgramAccount {
    account: {
        data: {
            parsed: {
                info: {
                    isNative: false;
                    mint: string;
                    owner: string;
                    state: string;
                    tokenAmount: {
                        amount: string;
                        decimals: number;
                        uiAmount: number;
                        uiAmountString: string;
                    };
                };
            };
            program: 'spl-token';
            space: number;
        };
        executable: boolean;
        lamports: number;
        owner: string;
        rentEpoch: string;
    };
    pubkey: string;
}

export type GetBalanceResponse = RpcResponse<{ value: number }>;

export type GetProgramAccountsResponse = RpcResponse<ProgramAccount[]>;
