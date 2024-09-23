import { first, isEmpty } from 'lodash-es';
import urlcat from 'urlcat';

import { GO_PLUS_LABS_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { createSecurityResult } from '@/providers/goplus/createSecurityResult.js';
import { AddressSecurityMessages, TokenSecurityMessages } from '@/providers/goplus/rules.js';
import { type AddressSecurity, type GoPlusResponse, type TokenContractSecurity } from '@/providers/types/Security.js';

export class GoPlus {
    static async getTokenSecurity(chainId: number, address: string) {
        const url = urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/token_security/:chainId', {
            chainId,
            contract_addresses: address.toLowerCase(),
        });

        const res = await fetchJSON<GoPlusResponse<Record<string, TokenContractSecurity>>>(url);
        if (isEmpty(res.result)) return;

        const entity = first(Object.entries(res.result));
        if (!entity) return;

        const security = { ...entity[1], contract: entity[0], chainId };
        return createSecurityResult(security, TokenSecurityMessages, (info) => info.trust_list === '1');
    }
    static async getAddressSecurity(chainId: number, address: string) {
        const url = urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/address_security/:address', {
            address: address.toLowerCase(),
            chain_id: chainId,
        });

        const res = await fetchJSON<GoPlusResponse<AddressSecurity>>(url);
        if (isEmpty(res.result)) return;

        const security = { ...res.result, address, chainId };
        return createSecurityResult(security, AddressSecurityMessages);
    }
}
