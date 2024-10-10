import VerifyIcon from '@/assets/verify.svg';
import { classNames } from '@/helpers/classNames.js';
import { TwitterUserInfoProfileImageShape } from '@/providers/types/Firefly.js';
import type { ProfileVerifyInfo } from '@/providers/types/SocialMedia.js';

export function TwitterVerifyIcon({ data }: { data: ProfileVerifyInfo }) {
    let color = 'text-twitterVerified';
    if (data.__origin__.profile_image_shape === TwitterUserInfoProfileImageShape.Square) {
        color = data.__origin__.is_blue_verified ? 'text-twitterBlue' : 'text-twitterVerifiedGold';
    }
    return <VerifyIcon className={classNames('h-4 w-4 flex-shrink-0', color)} />;
}
