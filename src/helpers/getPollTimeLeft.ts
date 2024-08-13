import { plural, t } from '@lingui/macro';

export function getPollTimeLeft(endDatetime: string) {
    const now = new Date().getTime();
    const timeLeft = new Date(endDatetime).getTime() - now;

    if (timeLeft <= 0) {
        return t`Final results`;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    if (days >= 1) {
        return plural(days, { one: '1 day left', other: `${days} days left` });
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    if (hours >= 1) {
        return plural(hours, { one: '1 hour left', other: `${hours} hours left` });
    }

    const minutes = Math.floor(timeLeft / (1000 * 60));
    if (minutes >= 1) {
        return plural(minutes, { one: '1 minute left', other: `${minutes} minutes left` });
    }

    return t`Less than a minute left`;
}
