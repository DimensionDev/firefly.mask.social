import type { RedPacketNftRecord,RedPacketNftRecordInDatabase } from '@masknet/web3-providers/types';

export declare function getRedPacketNft(id: string): Promise<RedPacketNftRecord | undefined>;
export declare function addRedPacketNft(record: RedPacketNftRecord): Promise<void>;
export declare function updateRedPacketNft(newRecord: RedPacketNftRecordInDatabase): Promise<void>;
// # sourceMappingURL=databaseForNft.d.ts.map