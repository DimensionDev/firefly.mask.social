import { safeUnreachable } from '@masknet/kit';
import { Link } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { LoadingBase } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

const useStyles = makeStyles()({
    textLink: {
        color: '#8E96FF',
    },
});

function resolveProfileUrl(platform: FireflyRedPacketAPI.PlatformType, handle: string) {
    switch (platform) {
        case FireflyRedPacketAPI.PlatformType.farcaster:
            return `/profile/farcaster/${handle}`;
        case FireflyRedPacketAPI.PlatformType.lens:
            return `/profile/lens/${handle}`;
        case FireflyRedPacketAPI.PlatformType.twitter:
            return `/${handle}`;
        default:
            safeUnreachable(platform);
            return '';
    }
}

interface MentionLinkProps {
    platform: FireflyRedPacketAPI.PlatformType;
    profileId: string;
    handle?: string;
}

export function MentionLink({ platform, profileId, handle }: MentionLinkProps) {
    const { classes } = useStyles();
    const isTwitter = platform === FireflyRedPacketAPI.PlatformType.twitter;
    const { data: twitterHandle, isLoading } = useQuery({
        enabled: isTwitter && !handle,
        queryKey: ['twitter-user-info', profileId],
        queryFn: () => FireflyEndpointProvider.getUserInfoById(profileId),
        select(data) {
            return data?.username;
        },
    });

    if (isLoading) return <LoadingBase size={12} />;

    const screenName = isTwitter ? twitterHandle || handle : handle;
    if (!screenName) return <span>the creator</span>;

    return (
        <Link
            href={resolveProfileUrl(
                platform,
                platform === FireflyRedPacketAPI.PlatformType.farcaster ? profileId : screenName,
            )}
            target="_blank"
            className={classes.textLink}
        >
            @{isTwitter ? twitterHandle || handle : handle}
        </Link>
    );
}
