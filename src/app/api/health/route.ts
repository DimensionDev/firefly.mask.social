import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';

export async function GET(request: Request) {
    return createSuccessResponseJSON({ message: 'OK' });
}
