import { ChainId } from '@masknet/web3-shared-solana';

import { env } from '@/constants/env.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { RPC_Error } from '@/constants/error.js';

interface RpcOptions {
    method: string;
    params?: unknown[];
}

export async function requestRPC<T = unknown>(chainId: ChainId, options: RpcOptions): Promise<T> {
    const response = await fetchJSON<T & { error: unknown; message?: string }>(
        env.external.NEXT_PUBLIC_SOLANA_RPC_URL,
        {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                ...options,
                jsonrpc: '2.0',
                id: 0,
            }),
        },
    );

    if (response.error) throw new RPC_Error(response.message || 'Fails in requesting RPC');
    return response as T;
}
