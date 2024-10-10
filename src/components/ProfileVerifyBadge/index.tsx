import { useQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import type { HTMLProps } from 'react';

import PowerUserIcon from '@/assets/power-user.svg';
import { TwitterVerifyIcon } from '@/components/ProfileVerifyBadge/TwitterVerifyIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getTwitterProfileHandleFromUrl } from '@/helpers/getTwitterProfileHandleFromUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends HTMLProps<'div'> {
    source: SocialSource;
    handle: string;
    profile?: Pick<Profile, 'isPowerUser' | 'profileId'>;
}

export function ProfileVerifyBadge({ source, handle, profile, className }: Props) {
    const { data } = useQuery({
        queryKey: ['profile-verify-badge', source, handle],
        queryFn: async () => {
            const provider = resolveSocialMediaProvider(source);
            return provider.getProfileVerifyInfoByHandle(handle);
        },
        enabled: [Source.Twitter].includes(source),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const { data: badgeUrl } = useQuery({
        queryKey: ['badge-url', source, data?.url],
        async queryFn() {
            if (!data?.url) return;
            const identity = getTwitterProfileHandleFromUrl(data.url);
            const provider = resolveSocialMediaProvider(source);
            const { profileId } = await provider.getProfileByHandle(identity!);
            return resolveProfileUrl(source, profileId);
        },
        enabled: [Source.Twitter].includes(source),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const badgeEl = data?.badgeAvatarUrl ? (
        <img src={data.badgeAvatarUrl} className="h-4 w-4 flex-shrink-0" alt={data.description} />
    ) : null;

    const icons = compact([
        {
            [Source.Twitter]: data ? <TwitterVerifyIcon data={data} /> : null,
            [Source.Farcaster]: profile?.isPowerUser ? (
                <PowerUserIcon className="h-4 w-4 shrink-0" width={16} height={16} />
            ) : null,
            [Source.Lens]: null,
        }[source],
        badgeUrl ? <Link href={badgeUrl}>{badgeEl}</Link> : badgeEl,
    ]);

    if (!icons.length) return null;

    return <div className={className}>{icons}</div>;
}
