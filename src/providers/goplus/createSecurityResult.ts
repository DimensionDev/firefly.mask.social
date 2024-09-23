import { type SecurityMessage, SecurityMessageLevel } from '@/providers/types/Security.js';

type Params<T> = [security: T, messages: Array<SecurityMessage<T>>, skip?: (info: T) => boolean];

function isHighRisk<T>(...[security, messages, skip]: Params<T>) {
    return skip?.(security)
        ? false
        : messages.some(
              (x) => x.condition(security) && !x.shouldHide(security) && x.level === SecurityMessageLevel.High,
          );
}

function getMessageList<T>(...[security, messages, skip]: Params<T>) {
    return skip?.(security)
        ? []
        : messages
              .filter((x) => x.condition(security) && x.level !== SecurityMessageLevel.Safe && !x.shouldHide(security))
              .sort((a, z) => {
                  if (a.level === SecurityMessageLevel.High) return -1;
                  if (z.level === SecurityMessageLevel.High) return 1;
                  return 0;
              });
}

export function createSecurityResult<T>(...[security, messages, skip]: Params<T>) {
    const is_high_risk = isHighRisk<T>(security, messages, skip);
    const makeMessageList = getMessageList<T>(security, messages, skip);
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
