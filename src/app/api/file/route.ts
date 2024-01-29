import { ThirdwebStorage } from '@thirdweb-dev/storage';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';

const storage = new ThirdwebStorage({
    secretKey: process.env.THIRD_WEB_SECRECT_KEY,
});

export async function POST(request: Request) {
    const form = await request.formData();
    const files = form.getAll('file');
    if (files.length) {
        const file = files[0] as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const uri = await storage.upload(buffer);
        return createSuccessResponseJSON({ uri });
    }
    return createErrorResponseJSON('Failed to upload');
}
