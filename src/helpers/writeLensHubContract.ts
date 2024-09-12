import { writeContract } from '@wagmi/core';

import { LensHub } from '@/abis/LensHub.js';
import { config } from '@/configs/wagmiClient.js';
import { LENS_HUB_PROXY_ADDRESS } from '@/constants/index.js';

export function writeLensHubContract(functionName: string, args: Array<string | string[]>) {
    return writeContract(config, {
        abi: LensHub,
        address: LENS_HUB_PROXY_ADDRESS,
        args,
        functionName,
    });
}
