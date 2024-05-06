import { Source } from '@/constants/enum.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfileAll.js';

export function getCurrentProfile(source: Source) {
    return getCurrentProfileAll()[source];
}
