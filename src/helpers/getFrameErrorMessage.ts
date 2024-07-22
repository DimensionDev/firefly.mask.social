import { parseJSON } from '@/helpers/parseJSON.js';

export function getFrameErrorMessage(error: string) {
    const parsed = parseJSON(error as string);
    if (!parsed) return error;

    const errorIsMessage = parsed as { error: string } | undefined;
    if (typeof errorIsMessage === 'object' && typeof errorIsMessage.error === 'string') {
        return errorIsMessage.error;
    }

    const errorWithMessage = parsed as { message: string } | undefined;
    if (typeof errorWithMessage === 'object' && typeof errorWithMessage.message === 'string') {
        return errorWithMessage.message;
    }

    const errorWithMessages = parsed as { errors: string[] } | undefined;
    if (typeof errorWithMessages === 'object' && Array.isArray(errorWithMessages.errors)) {
        return errorWithMessages.errors.join(', ');
    }

    return 'The frame server cannot handle the post request correctly.';
}
