/* cspell:disable */
import { safeUnreachable } from '@masknet/kit';
import satori from 'satori';
import urlcat from 'urlcat';

import { RedPacketCover } from '@/components/RedPacket/Cover.js';
import { RedPacketPayload } from '@/components/RedPacket/Payload.js';
import { Locale } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { loadTwemojiUrls } from '@/helpers/loadTwemojiUrls.js';
import { removeVS16s } from '@/helpers/removeVS16s.js';
import type { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';
import { getSatoriFonts } from '@/services/getSatoriFonts.js';
import { settings } from '@/settings/index.js';
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
    message: string;
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
    console.info(`Get theme ${themeId}`, url, response.data);
    return response.data;
}

export async function createRedPacketImage(coverOrPayload: Cover | Payload, signal?: AbortSignal) {
    const { usage, themeId } = coverOrPayload;
    const [fonts, theme] = await Promise.all([getSatoriFonts(signal), getTheme(themeId, signal)]);

    if (!theme) {
        throw new Error(`Failed to get theme: ${themeId}`);
    }
    // satori might not support VS16s, so we remove them here
    coverOrPayload.message = removeVS16s(coverOrPayload.message);

    switch (usage) {
        case UsageType.Cover:
            return satori(<RedPacketCover theme={theme} {...coverOrPayload} />, {
                width: 1200,
                height: 840,
                fonts,
                graphemeImages: {
                    ...(await loadTwemojiUrls(coverOrPayload.message)),
                    ...(await loadTwemojiUrls(coverOrPayload.from)),
                },
            });
        case UsageType.Payload:
            return satori(<RedPacketPayload theme={theme} {...coverOrPayload} />, {
                width: 1200,
                height: 840,
                fonts,
                graphemeImages: {
                    ...(await loadTwemojiUrls(coverOrPayload.message)),
                    ...(await loadTwemojiUrls(coverOrPayload.from)),
                },
            });
        default:
            safeUnreachable(usage);
            throw new UnreachableError('usage', usage);
    }
}
