'use client';

import { ErrorHandler } from '@/components/ErrorHandler.js';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return <ErrorHandler className="w-full" error={error} reset={reset} />;
}
