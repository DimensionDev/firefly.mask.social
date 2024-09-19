'use client';

import { ErrorHandler } from '@/components/ErrorHandler.js';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return <ErrorHandler className="!h-auto min-h-[320px] flex-1" error={error} reset={reset} />;
}
