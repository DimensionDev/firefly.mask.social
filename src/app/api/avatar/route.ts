import { StatusCodes } from 'http-status-codes';
import { polygon } from 'viem/chains';

import { LensHub } from '@/abis/LensHub.js';
import { CACHE_AGE_INDEFINITE_ON_DISK, LENS_HUB_PROXY_ADDRESS } from '@/constants/index.js';
import { createWagmiPublicClient } from '@/helpers/createWagmiPublicClient.js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'Missing id' }, { status: StatusCodes.BAD_REQUEST });

    try {
        const client = createWagmiPublicClient(polygon);
        const data = await client.readContract({
            abi: LensHub,
            address: LENS_HUB_PROXY_ADDRESS,
            args: [id],
            functionName: 'tokenURI',
        });

        const jsonData = JSON.parse(Buffer.from((data as string).split(',')[1], 'base64').toString());
        const base64Image = jsonData.image.split(';base64,').pop();
        const svgImage = Buffer.from(base64Image, 'base64').toString('utf-8');

        return new Response(svgImage, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': CACHE_AGE_INDEFINITE_ON_DISK,
            },
        });
    } catch {
        return Response.json({ error: 'Failed to read tokenURI' }, { status: StatusCodes.BAD_REQUEST });
    }
}
