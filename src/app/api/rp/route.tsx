/* cspell:disable */

import { type NextRequest } from 'next/server.js';
import { z } from 'zod';

import { Locale } from '@/constants/enum.js';
import { CACHE_AGE_INDEFINITE_ON_DISK } from '@/constants/index.js';
import { createRedPacketImage } from '@/services/createRedPacketImage.js';
import { TokenType, UsageType } from '@/types/rp.js';

const TokenSchema = z.object({
    type: z.nativeEnum(TokenType),
    symbol: z.string(),
    decimals: z.coerce.number().int().nonnegative(),
});

const CoverSchema = z.object({
    locale: z.nativeEnum(Locale),
    themeId: z.string(),
    usage: z.literal(UsageType.Cover),
    from: z.string().refine((x) => (x ? x.length < 50 : true), { message: 'From cannot be longer than 50 characters' }),
    message: z
        .string()
        .transform((x) => (x ? decodeURIComponent(x) : x))
        .refine((x) => (x ? x.length < 100 : true), { message: 'Message cannot be longer than 100 characters' }),
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
                from,
                token,
            });
        case UsageType.Payload:
            return PayloadSchema.safeParse({
                usage,
                locale: params.get('locale') ?? Locale.en,
                themeId: params.get('theme-id'),
                amount: params.get('amount') ?? '0',
                from,
                token,
            });
        default:
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

    const image = await createRedPacketImage(parsedParams.data, request.signal);
    if (!image) return new Response('Failed to create image', { status: 500 });

    return new Response(image, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': CACHE_AGE_INDEFINITE_ON_DISK,
        },
    });
}
