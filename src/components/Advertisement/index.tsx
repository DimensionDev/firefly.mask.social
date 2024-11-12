import { AdvertisementSwiper } from '@/components/Advertisement/Swiper.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { settings } from '@/settings/index.js';
import type { Advertisement } from '@/types/advertisement.js';

export async function Advertisement() {
    try {
        const response = await fetchJSON<{ advertisements: Advertisement[] }>(settings.ADVERTISEMENT_JSON_URL, {
            next: {
                // 10 mins
                revalidate: 60 * 10,
            },
        });
        const data = (response?.advertisements ?? []).sort((a, b) => a.sort - b.sort);
        if (!data?.length) return null;

        return (
            <div>
                <AdvertisementSwiper items={data} />
            </div>
        );
    } catch (error) {
        console.error(`Failed to fetch advertisement: ${error}`);
        return null;
    }
}
