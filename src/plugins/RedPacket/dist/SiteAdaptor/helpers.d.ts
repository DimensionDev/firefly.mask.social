import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '@masknet/web3-providers/types';
import { type Result } from 'ts-results-es';

export declare function RedPacketMetadataReader(metadata: ReadonlyMap<string, unknown> | undefined): Result<RedPacketJSONPayload, void>;
export declare const renderWithRedPacketMetadata: (metadata: ReadonlyMap<string, unknown> | undefined, render: (data: RedPacketJSONPayload) => import("react").ReactNode) => import("react").ReactNode;
export declare const RedPacketNftMetadataReader: (meta: ReadonlyMap<string, unknown> | undefined) => Result<RedPacketNftJSONPayload, void>;
export declare const renderWithRedPacketNftMetadata: (metadata: ReadonlyMap<string, unknown> | undefined, render: (data: RedPacketNftJSONPayload) => import("react").ReactNode) => import("react").ReactNode;
// # sourceMappingURL=helpers.d.ts.map