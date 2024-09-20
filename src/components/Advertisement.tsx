'use client';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ClickableArea } from '@/components/ClickableArea.js';
import { AdFunctionType, AdvertisementType } from '@/constants/enum.js';
import { ADVERTISEMENT_JSON_URL } from '@/constants/index.js';
import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Advertisement } from '@/types/advertisement.js';

export function Advertisement() {
    const { data, isLoading } = useQuery({
        queryKey: ['advertisement'],
        staleTime: 1000 * 60 * 10,
        queryFn: async () => {
            const res = await fetchJSON<{ advertisements: Advertisement[] }>(ADVERTISEMENT_JSON_URL);
            return res?.advertisements ?? [];
        },
    });

    if (isLoading || !data?.length) return null;

    return (
        <div>
            <Swiper
                className="ff-advertisement"
                pagination
                loop
                modules={[Autoplay, Pagination, Navigation]}
                autoplay={{ delay: 8000 }}
                spaceBetween={50}
            >
                {data.map((ad, index) => (
                    <SwiperSlide key={index} className="w-96">
                        {ad.type === AdvertisementType.Link && ad.link ? (
                            <Link href={ad.link} target="_blank">
                                <Image
                                    className="w-full cursor-pointer"
                                    alt={ad.link}
                                    src={ad.image}
                                    width={346}
                                    height={130}
                                />
                            </Link>
                        ) : (
                            <ClickableArea
                                onClick={() => {
                                    switch (ad.function) {
                                        case AdFunctionType.OpenScan:
                                            LoginModalRef.open();
                                            break;
                                        default:
                                            safeUnreachable(ad.function);
                                            break;
                                    }
                                }}
                            >
                                <Image
                                    className="w-full cursor-pointer"
                                    alt={ad.function}
                                    src={ad.image}
                                    width={346}
                                    height={130}
                                />
                            </ClickableArea>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
