import { safeUnreachable } from '@masknet/kit';
import { kv } from '@vercel/kv';
import { ImageResponse } from '@vercel/og';
import { type NextRequest, NextResponse } from 'next/server.js';
import urlcat from 'urlcat';
import { keccak256, toHex } from 'viem';
import { z } from 'zod';

import { RedPacketCover } from '@/components/RedPacket/Cover.js';
import { RedPacketPayload } from '@/components/RedPacket/Payload.js';
import { KeyType } from '@/constants/enum.js';
import { CACHE_AGE_INDEFINITE_ON_DISK, SITE_URL } from '@/constants/index.js';
import { fetchArrayBuffer } from '@/helpers/fetchArrayBuffer.js';
import { uploadToBlob } from '@/services/uploadToBlob.js';
import { Locale } from '@/types/index.js';
import { CoBrandType, type Dimension, Theme, TokenType, UsageType } from '@/types/rp.js';

export const runtime = 'edge';

const TokenSchema = z.object({
    type: z.nativeEnum(TokenType),
    symbol: z.string(),
    decimals: z.coerce.number().int().nonnegative().optional(),
});

const CoverSchema = z.object({
    locale: z.nativeEnum(Locale),
    theme: z.nativeEnum(Theme),
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
        .refine((x) => x < 100, { message: 'Shares cannot be more than 100' }),
    remainingShares: z.coerce.number().nonnegative(),
    coBrand: z.nativeEnum(CoBrandType),
    token: TokenSchema,
});

const PayloadSchema = z.object({
    locale: z.nativeEnum(Locale),
    theme: z.nativeEnum(Theme),
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
                theme: params.get('theme') ?? Theme.Mask,
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
                theme: params.get('theme') ?? Theme.Mask,
                amount: params.get('amount') ?? '0',
                coBrand: params.get('co-brand') ?? CoBrandType.None,
                from,
                token,
            });
        default:
            return;
    }
}

function stringifyParams(params: ReturnType<typeof parseParams>) {
    if (!params?.success) return;
    const json = JSON.stringify(params.data, Object.keys(params.data).sort());
    return keccak256(toHex(json));
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
    ];
}

const DIMENSION_SETTINGS: Record<Theme, { cover: Dimension; payload: Dimension }> = {
    [Theme.Mask]: {
        cover: { width: 1200, height: 794 },
        payload: { width: 1200, height: 671 },
    },
    [Theme.GoldenFlower]: {
        cover: { width: 1200, height: 840 },
        payload: { width: 1200, height: 840 },
    },
    [Theme.LuckyFlower]: {
        cover: { width: 1200, height: 840 },
        payload: { width: 1200, height: 840 },
    },
    [Theme.LuckyFirefly]: {
        cover: { width: 1200, height: 840 },
        payload: { width: 1200, height: 840 },
    },
    [Theme.CoBranding]: {
        cover: { width: 1200, height: 840 },
        payload: { width: 1200, height: 840 },
    },
};

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

    const result = parseParams(request.nextUrl.searchParams);
    if (!result?.success) return new Response(`Invalid Params: ${result?.error.message}`, { status: 400 });

    // Generate filename from params
    const filename = stringifyParams(result);
    if (!filename) return new Response(`Failed to generate filename: ${JSON.stringify(result.data)}`, { status: 400 });

    // Check if the image exists in KV
    const url = await kv.hget(KeyType.UploadToBlob, `${filename}.png`);
    if (typeof url === 'string' && URL.canParse(url)) return NextResponse.redirect(url, 302);

    const params = result.data;
    const { usage, theme } = params;

    const fonts = await getFonts(request.signal);

    switch (usage) {
        case UsageType.Cover: {
            const response = new ImageResponse(<RedPacketCover {...params} />, {
                ...DIMENSION_SETTINGS[theme].cover,
                fonts,
                headers: {
                    'Cache-Control': CACHE_AGE_INDEFINITE_ON_DISK,
                },
            });
            return NextResponse.redirect(await uploadToBlob(`${filename}.png`, await response.clone().blob()), 302);
        }
        case UsageType.Payload: {
            const response = new ImageResponse(<RedPacketPayload {...params} />, {
                ...DIMENSION_SETTINGS[theme].payload,
                fonts,
                headers: {
                    'Cache-Control': CACHE_AGE_INDEFINITE_ON_DISK,
                },
            });
            return NextResponse.redirect(await uploadToBlob(`${filename}.png`, await response.clone().blob()), 302);
        }
        default:
            safeUnreachable(usage);
            return new Response('Invalid usage', { status: 400 });
    }
}
