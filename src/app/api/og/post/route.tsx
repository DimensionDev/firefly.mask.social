import { ImageResponse } from 'next/og.js';
import { z } from 'zod';

import { SourceInURL } from '@/constants/enum.js';
import { getSatoriFonts } from '@/helpers/getSatoriFonts.js';

const PayloadSchema = z.object({
    postId: z.string(),
    source: z.nativeEnum(SourceInURL),
});

export async function GET(request: Request) {
    return new ImageResponse(<div>Post</div>, {
        width: 1200,
        height: 630,
        fonts: await getSatoriFonts(request.signal),
    });
}
