import { env } from '@/constants/env.js';
import { ChainId } from '@/providers/types/Solana.js';

interface RpcOptions {
    method: string;
    params?: unknown[];
}

export async function requestRPC<T = unknown>(chainId: ChainId, options: RpcOptions): Promise<T> {
    const response = await globalThis.fetch(env.external.NEXT_PUBLIC_SOLANA_RPC_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
            ...options,
            jsonrpc: '2.0',
            id: 0,
        }),
    });
    const json = await response.json();
    if (json.error) throw new Error(json.message || 'Fails in requesting RPC');
    return json;
}
