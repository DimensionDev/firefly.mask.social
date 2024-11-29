/* eslint-disable no-restricted-imports */

import V1ABI from '@/maskbook/packages/web3-contracts/abis/HappyRedPacketV1.json' assert {type: 'json'};
import V2ABI from '@/maskbook/packages/web3-contracts/abis/HappyRedPacketV2.json' assert {type: 'json'};
import V3ABI from '@/maskbook/packages/web3-contracts/abis/HappyRedPacketV3.json' assert {type: 'json'};
import V4ABI from '@/maskbook/packages/web3-contracts/abis/HappyRedPacketV4.json' assert {type: 'json'};

export type { HappyRedPacketV1 } from '@/maskbook/packages/web3-contracts/types/HappyRedPacketV1.js';
export type { HappyRedPacketV2 } from '@/maskbook/packages/web3-contracts/types/HappyRedPacketV2.js';
export type { HappyRedPacketV3 } from '@/maskbook/packages/web3-contracts/types/HappyRedPacketV3.js';
export type { HappyRedPacketV4 } from '@/maskbook/packages/web3-contracts/types/HappyRedPacketV4.js';

export const HappyRedPacketV1ABI = V1ABI;
export const HappyRedPacketV2ABI = V2ABI;
export const HappyRedPacketV3ABI = V3ABI;
export const HappyRedPacketV4ABI = V4ABI;
