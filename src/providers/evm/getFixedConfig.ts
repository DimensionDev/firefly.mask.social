import type { Config } from '@wagmi/core';

import { config } from '@/configs/wagmiClient.js';

export function getFixedConfig() {
    return config as unknown as Config;
}
