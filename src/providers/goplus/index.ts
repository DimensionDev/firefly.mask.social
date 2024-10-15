import { first, isEmpty } from 'lodash-es';
import urlcat from 'urlcat';

import { GO_PLUS_LABS_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { createSecurityResult } from '@/providers/goplus/createSecurityResult.js';
import {
    AddressSecurityMessages,
    NFTSecurityMessages,
    SiteSecurityMessages,
    TokenSecurityMessages,
} from '@/providers/goplus/rules.js';
import {
    type AddressSecurity,
    type CheckTransactionRequest,
    type CheckTransactionResponse,
    type GoPlusResponse,
    type NFTSecurity,
    SecurityMessageLevel,
    type SiteSecurity,
    type TokenContractSecurity,
} from '@/providers/types/Security.js';
import { settings } from '@/settings/index.js';

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
    static async checkPhishingSite(siteUrl: string) {
        const url = urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/phishing_site', {
            url: siteUrl,
        });

        const res = await fetchJSON<GoPlusResponse<SiteSecurity>>(url);
        if (isEmpty(res.result)) return;

        const security = { ...res.result, siteUrl };
        return createSecurityResult(security, SiteSecurityMessages);
    }
    static async getNFTSecurity(chainId: number, address: string, tokenId?: string) {
        const url = urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/nft_security/:chainId', {
            chainId,
            contract_addresses: address.toLowerCase(),
            token_id: tokenId,
        });

        const res = await fetchJSON<GoPlusResponse<NFTSecurity>>(url);
        if (isEmpty(res.result)) return;

        const security = { ...res.result, address, chainId, tokenId };
        return createSecurityResult(security, NFTSecurityMessages);
    }
    static async checkTransaction(options: CheckTransactionRequest) {
        const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/goplus/tx_check');

        const res = await fireflySessionHolder.fetch<CheckTransactionResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        });

        const data = resolveFireflyResponseData(res) || {};

        return [
            data.risky_items?.map((item) => ({ ...item, level: SecurityMessageLevel.High })) || [],
            data.warning_items?.map((item) => ({ ...item, level: SecurityMessageLevel.Medium })) || [],
        ].flat();
    }
}
