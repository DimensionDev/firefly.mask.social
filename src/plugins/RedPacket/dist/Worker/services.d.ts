import { type NftRedPacketJSONPayload,type RedPacketJSONPayloadFromChain, type RedPacketRecord } from '@masknet/web3-providers/types';
import type { ChainId } from '@masknet/web3-shared-evm';

export { addRedPacketNft, getRedPacketNft, updateRedPacketNft } from '../../src/Worker/databaseForNft.ts';
export declare function addRedPacket(record: RedPacketRecord, chainId: ChainId): Promise<void>;
export declare function getRedPacketRecord(txId: string): Promise<RedPacketRecord | undefined>;
export declare function getRedPacketHistoryFromDatabase(redpacketsFromChain: RedPacketJSONPayloadFromChain[]): Promise<RedPacketJSONPayloadFromChain[]>;
export declare function getNftRedPacketHistory(histories: NftRedPacketJSONPayload[]): Promise<NftRedPacketJSONPayload[]>;
// # sourceMappingURL=services.d.ts.map
