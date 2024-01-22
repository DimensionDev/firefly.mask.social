import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base';
import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL, SITE_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import {
    ActionType,
    type ClaimResponse,
    type HistoryResponse,
    type PostReaction,
    type ProfileReaction,
    type PublicKeyResponse,
    type RedPacketClaimedInfo,
    type RedPacketSentInfo,
    SourceType,
    type StrategyPayload,
    type ThemeSettings,
} from '@/providers/types/FireflyRedPacket.js';
import { Theme, UsageType } from '@/types/rp.js';

export class FireflyRedPacket {
    async getThemeSettings(): Promise<ThemeSettings[]> {
        return [
            {
                id: 0,
                payloadUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: Theme.GoldenFlower,
                }),
                coverUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: Theme.GoldenFlower,
                    usage: UsageType.Cover,
                }),
            },
            {
                id: 1,
                payloadUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: Theme.LuckyFirefly,
                }),
                coverUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: Theme.LuckyFirefly,
                    usage: UsageType.Cover,
                }),
            },
            {
                id: 2,
                payloadUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: Theme.LuckyFlower,
                }),
                coverUrl: urlcat(SITE_URL, '/api/rp', {
                    theme: Theme.LuckyFlower,
                    usage: UsageType.Cover,
                }),
            },
        ];
    }

    async createPublicKey(themeId: number, payloads: StrategyPayload[]): Promise<string> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/createPublicKey');
        const { data } = await fetchJSON<PublicKeyResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                themeId,
                claimFrom: SourceType.FireflyPC,
                claimStrategy: JSON.stringify(payloads),
            }),
        });

        return data.publicKey;
    }

    async updateClaimStrategy(rpid: string, reactions: PostReaction[]): Promise<void> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/updateClaimStrategy');
        await fetchJSON(url, {
            method: 'POST',
            body: JSON.stringify({
                rpid,
                postReaction: reactions,
            }),
        });
    }

    async createClaimSignature(rpid: string, from: `0x${string}`, reaction: ProfileReaction): Promise<string> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/claim');
        const { data } = await fetchJSON<ClaimResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                rpid,
                profile: reaction,
                wallet: {
                    address: from,
                },
            }),
        });
        return data.signedMessage;
    }

    async getHistory<T extends ActionType, R = T extends ActionType.Claim ? RedPacketClaimedInfo : RedPacketSentInfo>(
        actionType: T,
        from: `0x${string}`,
        indicator?: PageIndicator,
    ): Promise<Pageable<R, PageIndicator>> {
        const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/history');
        const { data } = await fetchJSON<HistoryResponse>(url, {
            method: 'GET',
            body: JSON.stringify({
                address: from,
                redpacketType: actionType,
                claimFrom: SourceType.FireflyPC,
                cursor: indicator?.id,
                size: 20,
            }),
        });

        return createPageable(
            data.list as R[],
            createIndicator(indicator),
            createNextIndicator(indicator, data.cursor.toString()),
        );
    }
}

export const FireflyRedPacketProvider = new FireflyRedPacket();
