import { useInView } from 'react-cool-inview';

import { SocialPlatform } from '@/constants/enum.js';
import { addPostViews } from '@/helpers/addPostViews.js';

export function useObserveLensPost(id: string, source: SocialPlatform) {
    return useInView({
        onChange: async ({ inView }) => {
            if (!inView || source !== SocialPlatform.Lens) return;
            addPostViews(id);
        },
    });
}
