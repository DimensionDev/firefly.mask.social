import type { NextRequest } from 'next/server.js';
import { type ZodObject, type ZodRawShape } from 'zod';

export function getSearchParamsFromRequestWithZodObject<T extends ZodRawShape>(
    request: NextRequest,
    schemas: ZodObject<T>,
): Record<keyof T, string> {
    const keys = Object.keys(schemas._def.shape());
    const searchParamsObject = keys.reduce((acc, key) => {
        const value = request.nextUrl.searchParams.get(key);
        if (!value) return acc;
        return {
            ...acc,
            [key]: value,
        };
    }, {});
    schemas.parse(searchParamsObject);
    return searchParamsObject as Record<keyof T, string>;
}
