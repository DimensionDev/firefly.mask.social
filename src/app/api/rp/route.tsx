/* cspell:disable */

import { safeUnreachable } from '@masknet/kit';
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { type NextRequest } from 'next/server.js';
import satori, { type Font } from 'satori';
import urlcat from 'urlcat';
import { z } from 'zod';

import { RedPacketCover } from '@/components/RedPacket/Cover.js';
import { RedPacketPayload } from '@/components/RedPacket/Payload.js';
import { CACHE_AGE_INDEFINITE_ON_DISK, FIREFLY_ROOT_URL, SITE_URL } from '@/constants/index.js';
import { fetchArrayBuffer } from '@/helpers/fetchArrayBuffer.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getTwemojiUrls } from '@/helpers/getTwemojiUrls.js';
import { Locale } from '@/types/index.js';
import { CoBrandType, TokenType, UsageType } from '@/types/rp.js';

const TokenSchema = z.object({
    type: z.nativeEnum(TokenType),
    symbol: z.string(),
    decimals: z.coerce.number().int().nonnegative().optional(),
});

const CoverSchema = z.object({
    locale: z.nativeEnum(Locale),
    themeId: z.string(),
    usage: z.literal(UsageType.Cover),
    from: z.string().refine((x) => (x ? x.length < 50 : true), { message: 'From cannot be longer than 50 characters' }),
    message: z
        .string()
        .transform((x) => (x ? decodeURIComponent(x) : x))
        .refine((x) => (x ? x.length < 50 : true), { message: 'Message cannot be longer than 50 characters' }),
    amount: z.coerce
        .bigint()
        .nonnegative()
        .transform((x) => x.toString(10)),
    remainingAmount: z.coerce
        .bigint()
        .nonnegative()
        .transform((x) => x.toString(10)),
    shares: z.coerce
        .number()
        .positive()
        .refine((x) => x < 256, { message: 'Shares cannot be more than 256' }),
    remainingShares: z.coerce.number().nonnegative(),
    coBrand: z.nativeEnum(CoBrandType),
    token: TokenSchema,
});

const PayloadSchema = z.object({
    locale: z.nativeEnum(Locale),
    themeId: z.string(),
    usage: z.literal(UsageType.Payload),
    from: z.string(),
    amount: z.coerce
        .bigint()
        .nonnegative()
        .transform((x) => x.toString(10)),
    coBrand: z.nativeEnum(CoBrandType),
    token: TokenSchema,
});

function parseParams(params: URLSearchParams) {
    const usage = params.get('usage') ?? UsageType.Cover;
    const from = params.get('from') ?? 'unknown';
    const token = {
        type: params.get('type') ?? TokenType.Fungible,
        symbol: params.get('symbol') ?? '?',
        decimals: params.get('decimals') ?? '0',
    };

    switch (usage) {
        case UsageType.Cover:
            return CoverSchema.safeParse({
                usage,
                locale: params.get('locale') ?? Locale.en,
                themeId: params.get('theme-id'),
                amount: params.get('amount') ?? '0',
                remainingAmount: params.get('remaining-amount') ?? params.get('amount') ?? '0',
                shares: params.get('shares') ?? '0',
                remainingShares: params.get('remaining-shares') ?? params.get('shares') ?? '0',
                message: params.get('message') ?? 'Best Wishes!',
                coBrand: params.get('co-brand') ?? CoBrandType.None,
                from,
                token,
            });
        case UsageType.Payload:
            return PayloadSchema.safeParse({
                usage,
                locale: params.get('locale') ?? Locale.en,
                themeId: params.get('theme-id'),
                amount: params.get('amount') ?? '0',
                coBrand: params.get('co-brand') ?? CoBrandType.None,
                from,
                token,
            });
        default:
            return;
    }
}

async function getFonts(signal?: AbortSignal) {
    return [
        {
            name: 'Inter',
            data: await fetchArrayBuffer(urlcat(SITE_URL, '/font/Inter-Regular.ttf'), {
                cache: 'force-cache',
                signal,
            }),
            weight: 400,
            style: 'normal',
        },
        {
            name: 'Inter',
            data: await fetchArrayBuffer(urlcat(SITE_URL, '/font/Inter-Bold.ttf'), {
                cache: 'force-cache',
                signal,
            }),
            weight: 700,
            style: 'normal',
        },
        {
            name: 'sans-serif',
            data: await fetchArrayBuffer(urlcat(SITE_URL, '/font/NotoSansSC-Regular.ttf'), {
                cache: 'force-cache',
                signal,
            }),
            weight: 400,
            style: 'normal',
        },
        {
            name: 'sans-serif',
            data: await fetchArrayBuffer(urlcat(SITE_URL, '/font/NotoSansSC-Bold.ttf'), {
                cache: 'force-cache',
                signal,
            }),
            weight: 700,
            style: 'normal',
        },
    ] satisfies Font[];
}

async function getTheme(themeId: string, signal?: AbortSignal) {
    const url = urlcat(FIREFLY_ROOT_URL, '/v1/redpacket/themeById', {
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

async function compressImage(image: string, backgroundImageUrl?: string) {
    if (!backgroundImageUrl) return;
    return image.replace(/data:image\/.+;base64,[^"]+/, backgroundImageUrl);
}

async function createImage(params: z.infer<typeof CoverSchema> | z.infer<typeof PayloadSchema>, signal?: AbortSignal) {
    const { usage, themeId } = params;

    const [fonts, theme] = await Promise.all([getFonts(signal), getTheme(themeId, signal)]);

    switch (usage) {
        case UsageType.Cover: {
            return compressImage(
                await satori(<RedPacketCover theme={theme} {...params} />, {
                    width: 1200,
                    height: 840,
                    fonts,
                    graphemeImages: getTwemojiUrls(params.message),
                }),
                theme.normal.bg_image,
            );
        }
        case UsageType.Payload: {
            return compressImage(
                await satori(<RedPacketPayload theme={theme} {...params} />, {
                    width: 1200,
                    height: 840,
                    fonts,
                }),
                theme.cover.bg_image,
            );
        }
        default:
            safeUnreachable(usage);
            return;
    }
}

export async function GET(request: NextRequest) {
    // If no params, throw the usage message.
    if (request.nextUrl.searchParams.size === 0) {
        const result = CoverSchema.safeParse({
            locale: Locale.en,
        });
        return new Response(result.success ? 'Invalid Params.' : `Full Params: ${result.error.message}`, {
            status: 400,
        });
    }

    const parsedParams = parseParams(request.nextUrl.searchParams);
    if (!parsedParams?.success) return new Response(`Invalid Params: ${parsedParams?.error.message}`, { status: 400 });

    const image = await createImage(parsedParams.data, request.signal);
    if (!image) return new Response('Failed to create image', { status: 500 });

    return new Response(image, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': CACHE_AGE_INDEFINITE_ON_DISK,
        },
    });
}
