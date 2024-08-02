import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { getAllPlatformProfileFromFirefly } from '@/services/getAllPlatformProfileFromFirefly.js';
import { settings } from '@/settings/index.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

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

function report(params: UploadTokenTipsParams) {
    return fetchJSON(urlcat(settings.FIREFLY_ROOT_URL, '/v1/token_tips/upload'), {
        method: 'POST',
        body: JSON.stringify({ ...params, source: 'web' }),
    });
}

export async function reportTokenTips(
    source: Source,
    identity: string,
    params: UploadTokenTipsParams,
) {
    const profile =
        useLensStateStore.getState().currentProfile ||
        useFarcasterStateStore.getState().currentProfile ||
        useTwitterStateStore.getState().currentProfile;

    const from_account_id = profile
        ? await getAllPlatformProfileFromFirefly(profile.source, resolveProfileId(profile)!)
              .then((x) => x.data?.fireflyAccountId)
              .catch(() => undefined)
        : undefined;
    const to_account_id = await getAllPlatformProfileFromFirefly(source, identity)
        .then((x) => x.data?.fireflyAccountId)
        .catch(() => undefined);
        
    return report({
        from_account_id,
        to_account_id,
        ...params,
    });
}
