import type { NextRequest } from 'next/server.js';
import { z, type ZodObject, type ZodRawShape } from 'zod';

export async function getJsonBodyFromRequestWithZodObject<T extends ZodRawShape>(
    request: NextRequest,
    schema: ZodObject<T>,
): Promise<z.infer<ZodObject<T>>> {
    const body = await request.json();
    return schema.parse(body);
}
