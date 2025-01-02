import { LinkIcon } from '@heroicons/react/24/outline';
import { skipToken, useQuery } from '@tanstack/react-query';

import DiscordRound from '@/assets/discord-round.svg';
import FacebookColored from '@/assets/facebook-colored.svg';
import GitHub from '@/assets/github.svg';
import Instagram from '@/assets/instagram.svg';
import Medium from '@/assets/medium.svg';
import RedditRound from '@/assets/reddit-round.svg';
import TelegramRound from '@/assets/telegram-round.svg';
import YouTube from '@/assets/youtube.svg';
import { Link } from '@/components/Link.js';
import { Tooltip } from '@/components/Tooltip.js';
import { XIcon } from '@/components/XIcon.js';
import { Source } from '@/constants/enum.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { CommunityUrl } from '@/providers/types/Trending.js';

interface Props {
    link: CommunityUrl;
    iconSize?: number;
}

const brands = {
    discord: DiscordRound,
    facebook: FacebookColored,
    github: GitHub,
    instagram: Instagram,
    medium: Medium,
    reddit: RedditRound,
    telegram: TelegramRound,
    twitter: XIcon,
    youtube: YouTube,
    linkedin: LinkIcon,
    other: LinkIcon,
};

export function CommunityLink({ link, iconSize = 16 }: Props) {
    const isTwitterLogin = useIsLogin(Source.Twitter);

    const isTwitter = link.type === 'twitter';
    const url = new URL(link.link);
    const handle = isTwitter ? url.pathname.slice(1) : null;

    const { data: fireflyTwitterLink } = useQuery({
        queryKey: ['twitter', 'profile-by-handle', handle],
        enabled: isTwitterLogin && !!handle,
        queryFn: handle ? () => TwitterSocialMediaProvider.getProfileByHandle(handle) : skipToken,
        select: (data) => resolveProfileUrl(Source.Twitter, data.profileId),
    });

    const href = fireflyTwitterLink || link.link;
    if (!href || !brands[link.type]) return null;

    const PlatformIcon = brands[link.type];

    return (
        <Tooltip content={fireflyTwitterLink ? `@${handle}` : url.host} placement="top">
            <Link className="z-10" href={href} target={fireflyTwitterLink ? undefined : '_blank'}>
                <PlatformIcon width={iconSize} height={iconSize} />
            </Link>
        </Tooltip>
    );
}
