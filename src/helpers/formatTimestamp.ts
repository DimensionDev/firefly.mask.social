import { i18n } from '@lingui/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import dayjsTwitter from 'dayjs-twitter';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(dayjsTwitter);

/**
 * Formats a date as a string in the format used by the application.
 * @param date The date to format.
 * @returns A string in the application date format.
 */
export function formatDate(date?: Date, format = 'MMMM D, YYYY') {
    return date ? i18n.date(date, { dateStyle: 'medium', timeStyle: 'medium' }) : '';
}

/**
 * Gets the time resulting from adding a specified number of days to the current date and time, in UTC format.
 *
 * @param day The number of days to add.
 * @returns The resulting date and time in UTC format.
 */
export function getTimeAddedNDay(day: number) {
    return dayjs().add(day, 'day').utc().format();
}

/**
 * Gets the number of days between the current date and time and a specified date and time.
 * @param date The to date to calculate the number of days.
 * @returns The number of days between the current date and time and the specified date and time.
 */
export function getNumberOfDaysFromDate(date: Date) {
    const currentDate = dayjs().startOf('day');
    const targetDate = dayjs(date).startOf('day');
    return targetDate.diff(currentDate, 'day');
}

/**
 * Formats a date as a string representing the elapsed time between the date and the current time.
 *
 * @param date The date to format.
 * @returns A string representing the elapsed time between the date and the current time.
 */
export function getTimeToNow(date: Date) {
    return dayjs(date).toNow(true);
}

/**
 * Formats a date as a string in the format used by Twitter.
 *
 * @param date The date to format.
 * @returns A string in the Twitter date format.
 */
export function getTwitterFormat(date: Date | string | number) {
    return dayjs(new Date(date)).twitter();
}
