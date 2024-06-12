/* cspell:disable */
import { safeUnreachable } from '@masknet/kit';
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import satori from 'satori';
import urlcat from 'urlcat';

import { RedPacketCover } from '@/components/RedPacket/Cover.js';
import { RedPacketPayload } from '@/components/RedPacket/Payload.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { loadTwemojiUrls } from '@/helpers/loadTwemojiUrls.js';
import { removeVS16s } from '@/helpers/removeVS16s.js';
import { getSatoriFonts } from '@/services/getSatoriFonts.js';
import { settings } from '@/settings/index.js';
import { Locale } from '@/types/index.js';
import { TokenType, UsageType } from '@/types/rp.js';

interface Cover {
    locale: Locale;
    themeId: string;
    usage: UsageType.Cover;
    from: string;
    message: string;
    amount: string;
    remainingAmount: string;
    shares: number;
    remainingShares: number;
    token: {
        type: TokenType;
        symbol: string;
        decimals: number;
    };
}

interface Payload {
    locale: Locale;
    themeId: string;
    usage: UsageType.Payload;
    from: string;
    amount: string;
    token: {
        type: TokenType;
        symbol: string;
        decimals: number;
    };
}

async function getTheme(themeId: string, signal?: AbortSignal) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/redpacket/themeById', {
        themeId,
    });
    const response = await fetchJSON<FireflyRedPacketAPI.ThemeByIdResponse>(url, {
        next: {
            // revalidate at most every hour
            revalidate: 60 * 60,
        },
        signal,
    });
    return response.data;
}

export async function createRedPacketImage(coverOrPayload: Cover | Payload, signal?: AbortSignal) {
    const { usage, themeId } = coverOrPayload;
    const [fonts, theme] = await Promise.all([getSatoriFonts(signal), getTheme(themeId, signal)]);

    switch (usage) {
        case UsageType.Cover:
            // satori might not support VS16s, so we remove them here
            coverOrPayload.message = removeVS16s(coverOrPayload.message);

            return satori(<RedPacketCover theme={theme} {...coverOrPayload} />, {
                width: 1200,
                height: 840,
                fonts,
                graphemeImages: await loadTwemojiUrls(coverOrPayload.message),
            });
        case UsageType.Payload:
            return satori(<RedPacketPayload theme={theme} {...coverOrPayload} />, {
                width: 1200,
                height: 840,
                fonts,
            });
        default:
            safeUnreachable(usage);
            return;
    }
}
