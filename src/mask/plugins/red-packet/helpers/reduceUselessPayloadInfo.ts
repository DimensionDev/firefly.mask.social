import type { FungibleToken } from '@masknet/web3-shared-base';
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { omit, pick } from 'lodash-es';

import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';

export function reduceUselessPayloadInfo(payload: RedPacketJSONPayload): RedPacketJSONPayload {
    const token = pick(payload.token, ['decimals', 'symbol', 'address', 'chainId']) as FungibleToken<
        ChainId,
        SchemaType.Native | SchemaType.ERC20
    >;
    return { ...omit(payload, ['block_number']), token };
}
