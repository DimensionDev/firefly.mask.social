'use client';

import { getTwitterFormat } from '@/helpers/formatTimestamp.js';
import { useMounted } from '@/hooks/useMounted.js';

export function TimestampFormatter({ time }: { time: string | number | Date }) {
    const isMounted = useMounted();

    if (!isMounted) return null;
    return <>{getTwitterFormat(time)}</>;
}
