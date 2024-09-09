import type { AdFunctionType, AdvertisementType } from '@/constants/enum.js';

export interface Advertisement {
    sort: number;
    image: string;
    link: string;
    type: AdvertisementType;
    function: AdFunctionType;
}
