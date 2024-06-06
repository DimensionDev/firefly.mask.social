import type { CompositePoll } from '@/providers/types/Poll.js';

// This function calculates the total number of seconds in a given duration
export const getPollDurationSeconds = (duration: CompositePoll['duration']) => {
    const { days, hours, minutes } = duration;
    return (days * 24 * 60 + hours * 60 + minutes) * 60;
};
