'use client';

import { useQuery } from '@tanstack/react-query';

import { AdvertisementSwiper } from '@/components/Advertisement/AdvertisementSwiper.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { settings } from '@/settings/index.js';
import type { Advertisement } from '@/types/advertisement.js';

export function Advertisement() {
    const configUrl = settings.ADVERTISEMENT_JSON_URL;

    const { data, isLoading } = useQuery({
        queryKey: ['advertisement', configUrl],
        staleTime: 1000 * 60 * 10,
        queryFn: async () => {
            const res = await fetchJSON<{ advertisements: Advertisement[] }>(configUrl);
            return (res?.advertisements ?? []).sort((a, b) => a.sort - b.sort);
        },
    });

    if (isLoading) {
        return <div className="h-[133px] animate-pulse rounded-xl bg-bg" />;
    }

    if (!data?.length) return null;

    return <AdvertisementSwiper data={data} />;
}
