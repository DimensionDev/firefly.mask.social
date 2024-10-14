import urlcat from 'urlcat';

import { DEBANK_OPEN_API } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { GasPrice } from '@/providers/types/Debank.js';

export class Debank {
    static async getGasPrice(chain: string) {
        const url = urlcat(DEBANK_OPEN_API, '/v1/wallet/gas_market', {
            chain_id: chain,
        });

        return await fetchJSON<GasPrice[]>(url);
    }
}
