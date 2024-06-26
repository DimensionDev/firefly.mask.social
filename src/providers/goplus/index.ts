import urlcat from 'urlcat';

import { GO_PLUS_LABS_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

export class GoPlus {
    static async getTokenSecurity(chainId: number, address: string) {
        const url = urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/token_security/:chainId', {
            chainId,
            contract_address: [address.toLowerCase()],
        });
        fetchJSON(url);
    }
}
