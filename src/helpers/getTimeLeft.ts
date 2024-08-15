export function getTimeLeft(endDatetime: string) {
    const now = new Date().getTime();
    const timeLeft = new Date(endDatetime).getTime() - now;

    return {
        days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
        hours: Math.floor(timeLeft / (1000 * 60 * 60)),
        minutes: Math.floor(timeLeft / (1000 * 60)),
        seconds: Math.floor(timeLeft / 1000),
    };
}
