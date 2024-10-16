import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';

export function GET() {
    return createSuccessResponseJSON({
        time: new Date().toISOString(),
    });
}
