/* cspell:disable */

import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import type { Event, EventResponse, ParsedEvent } from '@/types/calendar.js';

const BASE_URL = 'https://mask-network-dev.firefly.land/v1/calendar/crypto_event_list';

function fixEventDate(event: Event): ParsedEvent {
    return {
        ...event,
        event_date: +event.event_date * 1000,
    };
}

interface LumaRawEvent {
    calendar: {
        geo_city: string;
        geo_country: string;
        geo_region: string;
    };
    event: {
        geo_address_info: {
            address: string;
            city: string;
            city_state: string;
            country: string;
            full_address: string;
            latitude: string;
            longitude: string;
            mode: string;
            place_id: string;
            region: string;
            type: string;
        };
    };
    hosts: Array<{
        avatar_url: string;
        name: string;
    }>;
}

function fixEvent(event: Event): ParsedEvent {
    const rawEvent = event.raw_data ? (event.raw_data as LumaRawEvent) : null;
    if (!rawEvent) return fixEventDate(event);
    const host = rawEvent.hosts[0];
    return {
        ...event,
        event_date: +event.event_date * 1000,
        event_city: rawEvent.calendar.geo_city,
        event_country: rawEvent.calendar.geo_country,
        event_full_location:
            rawEvent.event.geo_address_info.full_address ||
            compact([rawEvent.calendar.geo_region, rawEvent.calendar.geo_city, rawEvent.calendar.geo_country]).join(
                ', ',
            ),
        host_name: host?.name,
        host_avatar: host?.avatar_url,
    };
}

export class CalendarProvider {
    static async getNewsList(startDate: number, endDate?: number, indicator?: PageIndicator) {
        const response = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'coincarp',
                start_date: Math.floor(startDate / 1000),
                end_date: endDate ? Math.floor(endDate / 1000) : 0,
                cursor: indicator?.id,
            }),
        );
        if (!response.data) return createPageable([], indicator, createNextIndicator(indicator));
        const events = response.data.events.map(fixEventDate);
        return createPageable(events, indicator, createNextIndicator(indicator, response.data.page.next));
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
