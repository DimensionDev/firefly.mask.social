import type { RedPacketRecord, RedPacketRecordInDatabase } from '@masknet/web3-providers/types';
import type { Plugin } from '@masknet/plugin-infra';
export declare let RedPacketDatabase: Plugin.Worker.DatabaseStorage<RedPacketRecordInDatabase>;
export declare function setupDatabase(x: typeof RedPacketDatabase): void;
export declare function getAllRedpackets(ids: string[]): Promise<RedPacketRecord[]>;
export declare function getRedPacket(id: string): Promise<RedPacketRecord | undefined>;
export declare function addRedPacket(record: RedPacketRecord): Promise<void>;
//# sourceMappingURL=database.d.ts.map