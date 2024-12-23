import { createRenderWithMetadata, createTypedMessageMetadataReader } from '@masknet/typed-message-react';
import { ChainId } from '@masknet/web3-shared-evm';
import { Ok, type Result } from 'ts-results-es';

import { EVMChainResolver } from '@/mask/bindings/index.js';
import { RedPacketMetaKey } from '@/mask/plugins/red-packet/constants.js';
import Schema from '@/mask/plugins/red-packet/schema.json' with { type: 'json' };
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';

const reader = createTypedMessageMetadataReader<RedPacketJSONPayload>(RedPacketMetaKey, Schema);

export function RedPacketMetadataReader(
    metadata: ReadonlyMap<string, unknown> | undefined,
): Result<RedPacketJSONPayload, void> {
    const result = reader(metadata);
    if (result.isOk()) {
        const payload = result.value;
        // Hard code for legacy RedPacket
        if (!payload.token && payload.contract_version === 1 && payload.token_type === 0) {
            const chainId = payload.network === 'Mainnet' ? ChainId.Mainnet : undefined;
            if (!chainId) return result;

            return Ok({
                ...payload,
                token: EVMChainResolver.nativeCurrency(chainId),
            });
        }
        return result;
    }
    return result;
}
export const renderWithRedPacketMetadata = createRenderWithMetadata(RedPacketMetadataReader);
