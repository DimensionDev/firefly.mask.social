import { KeyType } from '@/constants/enum.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { FrameProcessor } from '@/libs/frame/Processor.js';

const digestLinkRedis = memoizeWithRedis(FrameProcessor.digestDocumentUrl, {
    key: KeyType.DigestFrameLink,
    resolver: (link) => link,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const link = searchParams.get('link');
    if (!link) return Response.json({ error: 'Missing link' }, { status: 400 });

    const response = await digestLinkRedis(decodeURIComponent(link), request.signal);
    if (!response) return Response.json({ error: 'Unable to digest link' }, { status: 500 });

    return Response.json(response);
}
