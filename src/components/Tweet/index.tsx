import type { TwitterComponents } from 'react-tweet';

import { Image } from '@/esm/Image.js';

export const components: TwitterComponents = {
    AvatarImg: (props) => <Image {...props} alt={props.alt} />,
    MediaImg: (props) => <Image {...props} fill unoptimized alt={props.alt} />,
};
