import { getRegisteredWeb3Networks } from '@masknet/web3-providers';

import type { NetworkPluginID } from '@/constants/enum.js';

export function getNetworkDescriptor(
    expectedPluginID: NetworkPluginID,
    expectedChainIdOrNetworkTypeOrID?: string | number,
) {
    return getRegisteredWeb3Networks(expectedPluginID).find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? ''),
    );
}
