'use client';

import { getTwitterFormat } from '@/helpers/formatTime';
import { useMounted } from '@/hooks/useMounted';

export function TimestampFormatter({ time }: { time: string | number | Date }) {
    const isMounted = useMounted();

    if (!isMounted) return null;
    return <>{getTwitterFormat(time)}</>;
}
