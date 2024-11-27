import type { NetworkPluginID } from '@/constants/enum.js';
import { getRegisteredWeb3Networks } from '@/mask/bindings/index.js';

export function getNetworkDescriptor(
    expectedPluginID: NetworkPluginID,
    expectedChainIdOrNetworkTypeOrID?: string | number,
) {
    return getRegisteredWeb3Networks(expectedPluginID).find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? ''),
    );
}
