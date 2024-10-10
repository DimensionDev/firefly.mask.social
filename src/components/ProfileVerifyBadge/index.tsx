import { useQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import type { HTMLProps } from 'react';

import { TwitterVerifyIcon } from '@/components/ProfileVerifyBadge/TwitterVerifyIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

interface Props extends HTMLProps<'div'> {
    source: SocialSource;
    handle: string;
}

export function ProfileVerifyBadge({ source, handle, className }: Props) {
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

    if (!data) {
        return null;
    }

    const icons = compact([
        {
            [Source.Twitter]: data ? <TwitterVerifyIcon data={data} /> : null,
            [Source.Farcaster]: null,
            [Source.Lens]: null,
        }[source],
        data?.badgeUrl ? <img src={data.badgeUrl} className="h-4 w-4 flex-shrink-0" alt={data.description} /> : null,
    ]);

    if (!icons.length) return null;

    return <div className={className}>{icons}</div>;
}
