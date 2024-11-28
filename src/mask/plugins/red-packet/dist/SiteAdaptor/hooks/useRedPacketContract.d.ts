import type { HappyRedPacketV1 } from '@masknet/web3-contracts/types/HappyRedPacketV1.js';
import type { HappyRedPacketV2 } from '@masknet/web3-contracts/types/HappyRedPacketV2.js';
import type { HappyRedPacketV3 } from '@masknet/web3-contracts/types/HappyRedPacketV3.js';
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js';
import { type ChainId } from '@masknet/web3-shared-evm';
export declare function useRedPacketContract(chainId: ChainId, version: number): HappyRedPacketV1 | HappyRedPacketV2 | HappyRedPacketV3 | HappyRedPacketV4 | null;
//# sourceMappingURL=useRedPacketContract.d.ts.map