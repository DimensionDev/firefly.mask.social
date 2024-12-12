import { OpenActionModuleType } from '@lens-protocol/client/gated';
/**
 * Returns the name of the specified module to be used in the actOn key.
 *
 * @param name Name of the module.
 * @returns Name of the module to be used in the actOn key.
 */
export const getOpenActionActOnKey = (name: string): string => {
    switch (name) {
        case OpenActionModuleType.SimpleCollectOpenActionModule:
            return 'simpleCollectOpenAction';
        case OpenActionModuleType.MultirecipientFeeCollectOpenActionModule:
            return 'multirecipientCollectOpenAction';
        default:
            return 'unknownOpenAction';
    }
};
