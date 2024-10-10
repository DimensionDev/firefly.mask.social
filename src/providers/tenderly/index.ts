import urlcat from 'urlcat';

import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { SimulateRequest, SimulateResponse } from '@/providers/types/Tenderly.js';
import { settings } from '@/settings/index.js';

export class Tenderly {
    static async simulateTransaction(options: SimulateRequest) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/wallet_transaction/simulate/transaction');

        const response = await fireflySessionHolder.fetch<SimulateResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        });

        return resolveFireflyResponseData(response);
    }
}
