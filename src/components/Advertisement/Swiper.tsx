'use client';

import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { safeUnreachable } from '@masknet/kit';
import { memo } from 'react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ClickableArea } from '@/components/ClickableArea.js';
import { Image } from '@/components/Image.js';
import { AdFunctionType, AdvertisementType } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { openWindow } from '@/helpers/openWindow.js';
import { ActivityModalRef, LoginModalRef } from '@/modals/controls.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import type { Advertisement } from '@/types/advertisement.js';

interface Props extends React.HTMLProps<'div'> {
    items: Advertisement[];
}

export const AdvertisementSwiper = memo(function AdvertisementSwiper({ items }: Props) {
    return (
        <Swiper
            className="ff-advertisement"
            pagination={{ clickable: true }}
            loop
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 8000 }}
            spaceBetween={50}
        >
            {items.map((ad, index) => (
                <SwiperSlide key={index} className="w-96">
                    {ad.type === AdvertisementType.Link && ad.link ? (
                        <Link href={ad.link} target="_blank">
                            <Image
                                className="w-full cursor-pointer rounded-xl"
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
                                    case AdFunctionType.OpenActivity:
                                        // native
                                        if (fireflyBridgeProvider.supported) {
                                            openWindow('https://cz.firefly.social/');
                                        } else {
                                            ActivityModalRef.open();
                                        }
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
    );
});
