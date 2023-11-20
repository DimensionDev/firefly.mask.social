'use client';

import { getTwitterFormat } from '@/helpers/formatTimestamp.js';
import { useMounted } from '@/hooks/useMounted.js';

export function TimestampFormatter({ time }: { time: string | number | Date | undefined }) {
    const isMounted = useMounted();

    if (!isMounted || !time) return null;
    return <>{getTwitterFormat(time)}</>;
}
