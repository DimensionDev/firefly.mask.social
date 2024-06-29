import { first, isEmpty } from 'lodash-es';
import urlcat from 'urlcat';

import { GO_PLUS_LABS_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SecurityMessages } from '@/providers/goplus/rules.js';
import { type GoPlusResponse, SecurityMessageLevel, type TokenSecurityType } from '@/providers/types/Security.js';

export class GoPlus {
    static async getTokenSecurity(chainId: number, address: string) {
        const url = urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/token_security/:chainId', {
            chainId,
            contract_addresses: address.toLowerCase(),
        });
        const res = await fetchJSON<GoPlusResponse<Record<string, TokenSecurityType>>>(url);
        return createTokenSecurity(chainId, res.result);
    }
}

function createTokenSecurity(chainId: number, response: Record<string, TokenSecurityType>) {
    if (isEmpty(response)) return;
    const entity = first(Object.entries(response));
    if (!entity) return;
    const tokenSecurity = { ...entity[1], contract: entity[0], chainId };
    const is_high_risk = isHighRisk(tokenSecurity);
    const makeMessageList = getMessageList(tokenSecurity);
    const risk_item_quantity = makeMessageList.filter((x) => x.level === SecurityMessageLevel.High).length;
    const warn_item_quantity = makeMessageList.filter((x) => x.level === SecurityMessageLevel.Medium).length;
    return {
        ...tokenSecurity,
        is_high_risk,
        risk_item_quantity,
        warn_item_quantity,
        message_list: makeMessageList,
    };
}

function isHighRisk(tokenSecurity?: TokenSecurityType) {
    if (!tokenSecurity) return false;
    return tokenSecurity.trust_list === '1'
        ? false
        : SecurityMessages.filter(
              (x) =>
                  x.condition(tokenSecurity) &&
                  x.level !== SecurityMessageLevel.Safe &&
                  !x.shouldHide(tokenSecurity) &&
                  x.level === SecurityMessageLevel.High,
          ).sort((a, z) => {
              if (a.level === SecurityMessageLevel.High) return -1;
              if (z.level === SecurityMessageLevel.High) return 1;
              return 0;
          }).length > 0;
}

function getMessageList(tokenSecurity: TokenSecurityType) {
    return tokenSecurity.trust_list === '1'
        ? []
        : SecurityMessages.filter(
              (x) =>
                  x.condition(tokenSecurity) && x.level !== SecurityMessageLevel.Safe && !x.shouldHide(tokenSecurity),
          ).sort((a, z) => {
              if (a.level === SecurityMessageLevel.High) return -1;
              if (z.level === SecurityMessageLevel.High) return 1;
              return 0;
          });
}
