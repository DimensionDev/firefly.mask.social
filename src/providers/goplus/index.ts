import { first, isEmpty } from 'lodash-es';
import urlcat from 'urlcat';

import { GO_PLUS_LABS_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { SecurityMessages } from '@/providers/goplus/rules.js';
import { type GoPlusResponse, SecurityMessageLevel, type TokenContractSecurity } from '@/providers/types/Security.js';

export class GoPlus {
    static async getTokenSecurity(chainId: number, address: string) {
        const url = urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/token_security/:chainId', {
            chainId,
            contract_addresses: address.toLowerCase(),
        });
        const res = await fetchJSON<GoPlusResponse<Record<string, TokenContractSecurity>>>(url);
        return createTokenSecurity(chainId, res.result);
    }
}

function createTokenSecurity(chainId: number, response: Record<string, TokenContractSecurity>) {
    if (isEmpty(response)) return;
    const entity = first(Object.entries(response));
    if (!entity) return;
    const security = { ...entity[1], contract: entity[0], chainId };
    const is_high_risk = isHighRisk(security);
    const makeMessageList = getMessageList(security);
    const risk_item_quantity = makeMessageList.filter((x) => x.level === SecurityMessageLevel.High).length;
    const warn_item_quantity = makeMessageList.filter((x) => x.level === SecurityMessageLevel.Medium).length;
    return {
        ...security,
        is_high_risk,
        risk_item_quantity,
        warn_item_quantity,
        message_list: makeMessageList,
    };
}

function isHighRisk(security?: TokenContractSecurity) {
    if (!security) return false;
    return security.trust_list === '1'
        ? false
        : SecurityMessages.filter(
              (x) =>
                  x.condition(security) &&
                  x.level !== SecurityMessageLevel.Safe &&
                  !x.shouldHide(security) &&
                  x.level === SecurityMessageLevel.High,
          ).sort((a, z) => {
              if (a.level === SecurityMessageLevel.High) return -1;
              if (z.level === SecurityMessageLevel.High) return 1;
              return 0;
          }).length > 0;
}

function getMessageList(security: TokenContractSecurity) {
    return security.trust_list === '1'
        ? []
        : SecurityMessages.filter(
              (x) => x.condition(security) && x.level !== SecurityMessageLevel.Safe && !x.shouldHide(security),
          ).sort((a, z) => {
              if (a.level === SecurityMessageLevel.High) return -1;
              if (z.level === SecurityMessageLevel.High) return 1;
              return 0;
          });
}
