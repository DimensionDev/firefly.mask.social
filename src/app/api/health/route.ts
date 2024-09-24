import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';

export async function GET(request: Request) {
    return createSuccessResponseJSON({ message: 'OK' });
}
