/* cspell:disable */

import urlcat from 'urlcat';

import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import type { EventResponse, MeetingEvent, NewsEvent, NftEvent } from '@/types/calendar.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';

const BASE_URL = 'https://mask-network-dev.firefly.land/v1/calendar/crypto_event_list';

class Provider {
    async getNewsList(startDate: number, endDate?: number) {
        const response = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'coincarp',
                start_date: startDate,
                end_date: endDate ? endDate : 0,
                cursor: 0,
            }),
        );
        const data = resolveFireflyResponseData(response);
        return data?.events?.map((x) => ({
            ...x,
            event_date: Number.parseInt(x.event_date, 10) * 1000,
        })) as NewsEvent[];
    }

    async getEventList(startDate: number, endDate?: number) {
        const response = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'link3',
                start_date: startDate,
                end_date: endDate ? endDate : 0,
                cursor: 0,
            }),
        );
        const data = resolveFireflyResponseData(response);
        return data?.events?.map((x) => ({
            ...x,
            event_date: Number.parseInt(x.event_date, 10) * 1000,
        })) as MeetingEvent[];
    }

    async getNFTList(startDate: number, endDate?: number) {
        const response = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'nftgo',
                start_date: startDate,
                end_date: endDate ? endDate : 0,
                cursor: 0,
            }),
        );
        const data = resolveFireflyResponseData(response);
        return data?.events?.map((x: any) => ({
            ...x,
            event_date: Number.parseInt(x.event_date, 10) * 1000,
        })) as NftEvent[];
    }
}

export const CalendarProvider = new Provider();
