import { ImageResponse } from '@vercel/og';
import { type NextRequest } from 'next/server.js';
import { z } from 'zod';

import { Locale } from '@/types/index.js';

export enum Theme {
    Mask = 'mask',
    GoldenFlower = 'golden-flower',
    LuckyFlower = 'lucky-flower',
    LuckyFirefly = 'lucky-firefly',
    CoBranding = 'co-branding',
}

export enum TokenType {
    Fungible = 'fungible',
    NonFungible = 'non-fungible',
}

export enum UsageType {
    Cover = 'cover',
    Payload = 'payload',
}

const ParamsSchema = z.object({
    locale: z.nativeEnum(Locale),
    theme: z.nativeEnum(Theme),
    message: z
        .string()
        .transform((x) => (x ? decodeURIComponent(x) : x))
        .refine((x) => (x ? x.length < 50 : true), { message: 'Message cannot be longer than 50 characters' }),
    amount: z.coerce.number().positive(),
    remaining: z.coerce.number().positive(),
    shares: z.coerce
        .number()
        .positive()
        .refine((x) => x < 100, { message: 'Shares cannot be more than 100' }),
    claimed: z.coerce.number().nonnegative(),
    from: z.string().refine((x) => (x ? x.length < 50 : true), { message: 'From cannot be longer than 50 characters' }),
    type: z.nativeEnum(TokenType),
    usage: z.nativeEnum(UsageType),
});

const SETTINGS: Record<Theme, { width: number; height: number }> = {
    [Theme.Mask]: { width: 1200, height: 671 },
    [Theme.GoldenFlower]: { width: 1200, height: 840 },
    [Theme.LuckyFlower]: { width: 1200, height: 840 },
    [Theme.LuckyFirefly]: { width: 1200, height: 840 },
    [Theme.CoBranding]: { width: 1200, height: 840 },
};

function parseParams(params: URLSearchParams) {
    return {
        locale: params.get('locale') ?? Locale.en,
        theme: params.get('theme') ?? Theme.Mask,
        message: params.get('message') ?? 'Best Wishes!',
        amount: params.get('amount') ?? '0',
        remaining: params.get('remaining') ?? params.get('amount') ?? '0',
        shares: params.get('shares') ?? '0',
        claimed: params.get('claimed') ?? '0',
        from: params.get('from') ?? 'unknown',
        type: params.get('type') ?? TokenType.Fungible,
        usage: params.get('usage') ?? UsageType.Cover,
    };
}

export async function GET(req: NextRequest) {
    // If no params, return the usage message.
    if (req.nextUrl.searchParams.size === 0) {
        const result = ParamsSchema.safeParse({
            locale: Locale.en,
        });
        return new Response(result.success ? 'Invalid Params.' : `Full Params: ${result.error.message}`, {
            status: 400,
        });
    }

    const result = ParamsSchema.safeParse(parseParams(req.nextUrl.searchParams));
    if (!result.success) return new Response(`Invalid Params: ${result.error.message}`, { status: 400 });

    const params = result.data;

    return new ImageResponse(<div>{JSON.stringify(params)}</div>, { width: 2032, height: 1344 });
}
