import { z } from 'zod';

import { Source } from '@/constants/enum.js';
import {
    MAX_PROFILE_BIO_SIZE,
    MAX_PROFILE_DISPLAY_NAME_SIZE,
    MAX_PROFILE_LOCATION_SIZE,
    MAX_PROFILE_WEBSITE_SIZE,
} from '@/constants/index.js';

export const TwitterEditProfile = z.object({
    name: z.string().min(1).max(MAX_PROFILE_DISPLAY_NAME_SIZE[Source.Twitter]).optional(),
    description: z.string().min(1).max(MAX_PROFILE_BIO_SIZE[Source.Twitter]).optional(),
    location: z.string().min(1).max(MAX_PROFILE_LOCATION_SIZE[Source.Twitter]).optional(),
    url: z.string().min(1).max(MAX_PROFILE_WEBSITE_SIZE[Source.Twitter]).optional(),
});
