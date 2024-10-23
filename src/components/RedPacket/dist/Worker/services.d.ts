import type { ChainId } from '@masknet/web3-shared-evm';
import { type RedPacketRecord, type RedPacketJSONPayloadFromChain, type NftRedPacketJSONPayload } from '@masknet/web3-providers/types';
export { addRedPacketNft, getRedPacketNft, updateRedPacketNft } from './databaseForNft.js';
export declare function addRedPacket(record: RedPacketRecord, chainId: ChainId): Promise<void>;
export declare function getRedPacketRecord(txId: string): Promise<RedPacketRecord | undefined>;
export declare function getRedPacketHistoryFromDatabase(redpacketsFromChain: RedPacketJSONPayloadFromChain[]): Promise<RedPacketJSONPayloadFromChain[]>;
export declare function getNftRedPacketHistory(histories: NftRedPacketJSONPayload[]): Promise<NftRedPacketJSONPayload[]>;
//# sourceMappingURL=services.d.ts.map