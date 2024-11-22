/* cspell:disable */

import urlcat from 'urlcat';

import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import type { Event, EventResponse, ParsedEvent } from '@/types/calendar.js';

const BASE_URL = 'https://mask-network-dev.firefly.land/v1/calendar/crypto_event_list';

function fixEvent(event: Event): ParsedEvent {
    return {
        ...event,
        event_date: +event.event_date * 1000,
    };
}

export class CalendarProvider {
    static async getNewsList(startDate: number, endDate?: number) {
        const response = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'coincarp',
                start_date: Math.floor(startDate / 1000),
                end_date: endDate ? Math.floor(endDate / 1000) : 0,
                cursor: 0,
            }),
        );
        const data = resolveFireflyResponseData(response);
        return data?.events?.map(fixEvent);
    }

    static async getEventList(start_date: number, end_date: number, indicator?: PageIndicator) {
        const res = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'luma',
                size: 20,
                cursor: indicator?.id,
                start_date: Math.floor(start_date / 1000),
                end_date: Math.floor(end_date / 1000),
            }),
        );
        if (!res?.data?.events.length) {
            return createPageable([], indicator, createNextIndicator(indicator));
        }

        const events = res.data.events.map(fixEvent);
        return createPageable(events, indicator, createNextIndicator(indicator, res.data.page.next));
    }
}
