import { StatusCodes } from 'http-status-codes';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { getGatewayErrorMessage } from '@/helpers/getGatewayErrorMessage.js';
import { ParagraphProcessor } from '@/providers/paragraph/Processor.js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const link = searchParams.get('link');
    if (!link) return createErrorResponseJSON('Missing link', { status: 400 });

    try {
        const result = await ParagraphProcessor.digestDocumentUrl(link, request.signal);

        if (!result) {
            return createErrorResponseJSON(`Unable to digest paragraph link = ${link}`, {
                status: StatusCodes.BAD_GATEWAY,
            });
        }

        return result;
    } catch (error) {
        return createErrorResponseJSON(getGatewayErrorMessage(error), {
            status: StatusCodes.BAD_GATEWAY,
        });
    }
}
