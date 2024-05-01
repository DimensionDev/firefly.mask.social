import type { ZodError } from 'zod';

export function handleZodErrorMessage(error: ZodError) {
    return 'InvalidParams: ' +
        error.issues.map((issue) => `(${issue.code})${issue.path.join('.')}: ${issue.message}`).join('; ');
}
