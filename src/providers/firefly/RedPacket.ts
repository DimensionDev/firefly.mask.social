import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import type { Response } from '@/providers/types/Firefly.js';
import {
    ActionType,
    type CheckClaimStrategyStatusOptions,
    type CheckClaimStrategyStatusResponse,
    type ClaimHistoryResponse,
    type ClaimPlatform,
    type ClaimResponse,
    type HistoryResponse,
    type ParseOptions,
    type ParseResponse,
    PlatformType,
    type PostOn,
    type PostReaction,
    type PublicKeyResponse,
    type RedPacketClaimedInfo,
    type RedPacketClaimListInfo,
    type RedPacketSentInfo,
    SourceType,
    type StrategyPayload,
    type ThemeByIdResponse,
    type ThemeListResponse,
} from '@/providers/types/RedPacket.js';

const SITE_URL = typeof location === 'undefined' ? '' : location.origin;
let apiRoot = process.env.NEXT_PUBLIC_FIREFLY_API_URL || 'https://api.firefly.land';

function fetchFireflyJSON<T>(url: string, init?: RequestInit): Promise<T> {
    return fetchJSON<T>(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });
}

export class FireflyRedPacket {
    static async parse(options: ParseOptions) {
        const url = urlcat(apiRoot, '/v1/misc/redpacket/parse');
        const { data } = await fetchFireflyJSON<ParseResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        });
        return data;
    }
    static async getPayloadUrls(from: string, amount?: string, type?: string, symbol?: string, decimals?: number) {
        const url = urlcat(apiRoot, '/v1/redpacket/themeList');
        const response = await fetchJSON<ThemeListResponse>(url);
        const data = resolveFireflyResponseData(response);
        return data.list.map((theme) => ({
            themeId: theme.tid,
            backgroundImageUrl: theme.cover.bg_image,
            backgroundColor: theme.cover.bg_color,
            url: urlcat(SITE_URL, '/api/rp', {
                'theme-id': theme.tid,
                usage: 'payload',
                from,
                amount,
                type,
                symbol,
                decimals,
            }),
        }));
    }

    static async getPayloadUrlByThemeId(
        themeId: string,
        from: string,
        amount?: string,
        type?: string,
        symbol?: string,
        decimals?: number,
    ) {
        const url = urlcat(apiRoot, 'v1/redpacket/themeById', {
            themeId,
        });
        const response = await fetchJSON<ThemeByIdResponse>(url);
        const data = resolveFireflyResponseData(response);
        return {
            themeId,
            url: urlcat(SITE_URL, '/api/rp', {
                'theme-id': themeId,
                usage: 'payload',
                from,
                amount,
                type,
                symbol,
                decimals,
            }),
            backgroundImageUrl: data.cover.bg_image,
            backgroundColor: data.cover.bg_color,
        };
    }

    static async getCoverUrlByRpid(
        rpid: string,
        symbol?: string,
        decimals?: number,
        shares?: number,
        amount?: string,
        from?: string,
        message?: string,
        remainingAmount?: string,
        remainingShares?: string,
    ) {
        const url = urlcat(apiRoot, 'v1/redpacket/themeById', {
            rpid,
        });
        const response = await fetchJSON<ThemeByIdResponse>(url);
        const data = resolveFireflyResponseData(response);
        // Just discard default theme, and this RedPacket will be treated as created from Mask
        if (data.is_default) return null;

        return {
            themeId: data.tid,
            backgroundImageUrl: data.normal.bg_image,
            backgroundColor: data.normal.bg_color,
            url: urlcat(SITE_URL, '/api/rp', {
                'theme-id': data.tid,
                usage: 'cover',
                symbol,
                decimals,
                shares,
                amount,
                from,
                message,
                'remaining-amount': remainingAmount,
                'remaining-shares': remainingShares,
            }),
        };
    }

    static async createPublicKey(themeId: string, shareFrom: string, payloads: StrategyPayload[]): Promise<HexString> {
        const url = urlcat(apiRoot, '/v1/redpacket/createPublicKey');
        const response = await fetchFireflyJSON<PublicKeyResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                themeId,
                shareFrom,
                claimFrom: SourceType.FireflyPC,
                claimStrategy: JSON.stringify(payloads),
            }),
        });
        const data = resolveFireflyResponseData(response);
        return data.publicKey;
    }

    static async updateClaimStrategy(
        rpid: string,
        reactions: PostReaction[],
        claimPlatform: ClaimPlatform[],
        postOn: PostOn[],
        publicKey: string,
    ): Promise<void> {
        const url = urlcat(apiRoot, '/v1/redpacket/updateClaimStrategy');
        await fetchFireflyJSON(url, {
            method: 'POST',
            body: JSON.stringify({
                publicKey,
                rpid,
                postReaction: reactions,
                postOn,
                claimPlatform,
            }),
        });
    }

    static async createClaimSignature(options: CheckClaimStrategyStatusOptions): Promise<HexString> {
        const url = urlcat(apiRoot, '/v1/redpacket/claim');
        const response = await fetchFireflyJSON<ClaimResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        });
        const data = resolveFireflyResponseData(response);
        return data.signedMessage;
    }

    static async getHistory<
        T extends ActionType,
        R = T extends ActionType.Claim ? RedPacketClaimedInfo : RedPacketSentInfo,
    >(
        actionType: T,
        from: HexString,
        platform: SourceType,
        indicator?: PageIndicator,
    ): Promise<Pageable<R, PageIndicator>> {
        if (!from) {
            return createPageable(EMPTY_LIST, createIndicator(indicator));
        }
        const url = urlcat(apiRoot, '/v1/redpacket/history', {
            address: from,
            redpacketType: actionType,
            claimFrom: platform,
            cursor: indicator?.id,
            size: 20,
        });
        const response = await fetchJSON<HistoryResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        return createPageable(
            data.list.map((v) => ({ ...v, chain_id: Number(v.chain_id) })) as R[],
            createIndicator(indicator),
            data.cursor ? createNextIndicator(indicator, data.cursor.toString()) : undefined,
        );
    }

    static async getClaimHistory(redpacket_id: string, indicator?: PageIndicator): Promise<RedPacketClaimListInfo> {
        const url = urlcat(apiRoot, '/v1/redpacket/claimHistory', {
            redpacketId: redpacket_id,
            cursor: indicator?.id,
            size: 20,
        });
        const response = await fetchJSON<ClaimHistoryResponse>(url, {
            method: 'GET',
        });
        const data = resolveFireflyResponseData(response);
        return { ...data, chain_id: Number(data.chain_id) };
    }

    static async checkClaimStrategyStatus(options: CheckClaimStrategyStatusOptions) {
        const url = urlcat(apiRoot, '/v1/redpacket/checkClaimStrategyStatus');
        return fetchFireflyJSON<CheckClaimStrategyStatusResponse>(url, {
            method: 'POST',
            body: JSON.stringify(options),
        });
    }
    static async finishClaiming(
        rpid: string,
        platform: PlatformType,
        profileId: string,
        handle: string,
        txHash: string,
    ) {
        const url = urlcat(apiRoot, '/v1/redpacket/finishClaiming');
        return fetchFireflyJSON<Response<string>>(url, {
            method: 'POST',
            body: JSON.stringify({
                rpid,
                claimPlatform: platform,
                claimProfileId: profileId,
                claimHandle: handle,
                txHash,
            }),
        });
    }
    static updateApiRoot(url: string) {
        apiRoot = url;
    }
}
