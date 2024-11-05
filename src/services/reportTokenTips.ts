import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { EmptyResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export enum UploadTokenTipsToken {
    NativeToken = 'native_token',
    ERC20 = 'erc20',
    ERC721 = 'erc721',
    ERC1155 = 'erc1155',
}

export interface UploadTokenTipsParams {
    from_account_id?: string;
    from_address: string;
    to_account_id?: string;
    to_address: string;
    chain_id: string;
    chain_name: string;
    amount: string;
    token_symbol: string;
    token_icon?: string;
    token_address: string;
    token_type: UploadTokenTipsToken;
    tip_memos?: string;
    tx_hash: string;
}

export async function reportTokenTips(params: UploadTokenTipsParams) {
    await fetchJSON<EmptyResponse>(urlcat(settings.FIREFLY_ROOT_URL, '/v1/token_tips/upload'), {
        method: 'POST',
        body: JSON.stringify({ ...params, source: 'web' }),
    });
}
