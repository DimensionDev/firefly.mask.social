import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { readPostLinksAll } from '@/services/getPostLinksKV.js';

export async function GET(request: Request) {
    try {
        const links = await readPostLinksAll(request);

        console.log('DEBUG: post-links');
        console.log(links);

        return createSuccessResponseJSON(links);
    } catch (error) {
        return createSuccessResponseJSON(null);
    }
}
