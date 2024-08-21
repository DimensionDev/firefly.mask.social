import { StatusCodes } from 'http-status-codes';

import { getGatewayErrorMessage } from '@/helpers/getGatewayErrorMessage.js';
import { ParagraphProcessor } from '@/providers/paragraph/Processor.js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const link = searchParams.get('link');
    if (!link) return Response.json({ error: 'Missing link' }, { status: 400 });

    try {
        const result = await ParagraphProcessor.digestDocumentUrl(link, request.signal);

        if (!result) {
            return Response.json(
                { error: `Unable to digest paragraph link = ${link}` },
                { status: StatusCodes.BAD_GATEWAY },
            );
        }

        return result;
    } catch (error) {
        return Response.json(getGatewayErrorMessage(error), {
            status: StatusCodes.BAD_GATEWAY,
        });
    }
}
