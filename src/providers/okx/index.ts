import urlcat from 'urlcat';

import { OKX_HOST } from '@/constants/okx.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { SupportedChainResponse } from '@/providers/okx/types.js';
/** request okx official API, and normalize the code */
async function fetchFromOKX<T extends { code: number }>(input: RequestInfo | URL, init?: RequestInit) {
    if (process.env.NODE_ENV === 'development') {
        if (typeof input === 'string' && input.includes('0x00000')) {
            console.warn('Do you forget to convert to okx native address?', input);
        }
    }
    const response = await fetchJSON<T>(input, init);
    return {
        ...response,
        code: +response.code,
    };
}

export class OKX {
    /**
     * @docs https://www.okx.com/web3/build/docs/waas/dex-get-aggregator-supported-chains
     */
    static async getSupportedChains() {
        const url = urlcat(OKX_HOST, '/api/v5/dex/aggregator/supported/chain');
        const res = await fetchFromOKX<SupportedChainResponse>(url);
        return res.code === 0 ? res.data : undefined;
    }
}
