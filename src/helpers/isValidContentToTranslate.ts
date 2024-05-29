
import { NUMBER_STRING_REGEX } from '@/constants/regexp.js';
import { trimify } from '@/helpers/trimify.js';

export const isValidContentToTranslate = (content: string) => {
    NUMBER_STRING_REGEX.lastIndex = 0;
    if (!trimify(content) || NUMBER_STRING_REGEX.test(content)) return false;
    return true;
};
