import { skipToken, useQuery } from '@tanstack/react-query';

import DiscordRound from '@/assets/DiscordRound.svg';
import FacebookColored from '@/assets/FacebookColored.svg';
import GitHub from '@/assets/GitHub.svg';
import Instagram from '@/assets/Instagram.svg';
import Medium from '@/assets/Medium.svg';
import RedditRound from '@/assets/RedditRound.svg';
import TelegramRound from '@/assets/TelegramRound.svg';
import TwitterXRound from '@/assets/TwitterXRound.svg';
import YouTube from '@/assets/YouTube.svg';
import { SourceInURL } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { CommunityUrl } from '@/providers/types/Trending.js';

interface Props {
    link: CommunityUrl;
}

const brands: Record<string, React.ReactNode> = {
    discord: <DiscordRound width={16} height={16} />,
    facebook: <FacebookColored width={16} height={16} />,
    github: <GitHub width={16} height={16} />,
    instagram: <Instagram width={16} height={16} />,
    medium: <Medium width={16} height={16} />,
    reddit: <RedditRound width={16} height={16} />,
    telegram: <TelegramRound width={16} height={16} />,
    twitter: <TwitterXRound width={16} height={16} />,
    youtube: <YouTube width={16} height={16} />,
    other: null,
};

export function CommunityLink({ link }: Props) {
    const isTwitter = link.type === 'twitter';
    const handle = isTwitter ? new URL(link.link).pathname.slice(1) : null;
    const { data: fireflyTwitterLink } = useQuery({
        queryKey: ['twitter', 'profile-by-handle', handle],
        queryFn: handle ? () => TwitterSocialMediaProvider.getProfileByHandle(handle) : skipToken,
        select: (data) => `/profile/${data.profileId}?source=${SourceInURL.Twitter}`,
    });

    const url = isTwitter ? fireflyTwitterLink : link.link;

    if (!url) return null;
    return (
        <Link href={url} target={isTwitter ? undefined : '_blank'}>
            {brands[link.type]}
        </Link>
    );
}
