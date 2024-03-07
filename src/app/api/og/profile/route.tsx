import { ImageResponse } from 'next/og.js';

import { getSatoriFonts } from '@/helpers/getSatoriFonts.js';

export async function GET(request: Request) {
    return new ImageResponse(<div>Profile</div>, {
        width: 1200,
        height: 630,
        fonts: await getSatoriFonts(),
    });
}
