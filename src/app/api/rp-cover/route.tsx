import { ImageResponse } from '@vercel/og';
import { type NextRequest } from 'next/server.js';

export async function GET(req: NextRequest) {
    return new ImageResponse(<div>Hello World!</div>, { width: 2032, height: 1344 });
}
