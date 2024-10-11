import { memo } from 'react';
import type { TweetV2 } from 'twitter-api-v2';

import { Avatar } from '@/components/Avatar.js';
import { ProfileVerifyBadge } from '@/components/ProfileVerifyBadge/index.js';
import { Source } from '@/constants/enum.js';
import { TWEET_SPACE_REGEX } from '@/constants/regexp.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export const TweetSpace = memo(function TweetSpace({ post }: { post: Post }) {
    if (post.source !== Source.Twitter) return;
    const tweet = post.__original__ as TweetV2;
    if (!tweet) return null;
    const entityUrl = tweet.entities?.urls?.find((url) => TWEET_SPACE_REGEX.test(url.expanded_url));
    if (!entityUrl) return null;

    return (
        <div className="bg-purple flex w-full flex-col space-y-3 rounded-2xl p-4 text-white">
            <h3 className="text-md font-semibold leading-6">{entityUrl.title}</h3>
            <div className="flex">
                <Avatar className="mr-2 h-[18px] w-[18px]" src={post.author.pfp} size={18} alt={post.author.handle} />
                <span className="mr-1 truncate text-medium font-bold leading-5">{post.author.displayName}</span>
                <ProfileVerifyBadge
                    className="flex flex-shrink-0 items-center space-x-1 sm:mr-2"
                    profile={post.author}
                />
            </div>
        </div>
    );
});
