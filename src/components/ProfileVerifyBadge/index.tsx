import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import type { HTMLProps } from 'react';

import PowerUserIcon from '@/assets/power-user.svg';
import VerifyIcon from '@/assets/verify.svg';
import { Image } from '@/components/Image.js';
import { Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props extends HTMLProps<'div'> {
    profile: Profile;
}

export function ProfileVerifyBadge({ profile, className }: Props) {
    const { data: icons = [] } = useQuery({
        queryKey: ['profile-badge', profile],
        queryFn: async () => {
            const provider = resolveSocialMediaProvider(profile.source);
            return provider.getProfileBadges(profile);
        },
        enabled: [Source.Twitter, Source.Farcaster].includes(profile.source),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    if (!icons.length) return null;

    console.log(icons);

    return (
        <div className={className}>
            {icons.map((icon, i) => {
                if (icon.icon) {
                    const iconEl = (
                        <Image key={i} src={icon.icon} className="h-4 w-4 flex-shrink-0" alt={icon.source} />
                    );
                    return icon.href ? <Link href={icon.href}>{iconEl}</Link> : iconEl;
                }
                switch (icon.source) {
                    case Source.Twitter:
                        const color = icon.color ?? 'text-twitterVerified';
                        return <VerifyIcon key={i} className={classNames('h-4 w-4 shrink-0', color)} />;
                    case Source.Farcaster:
                        return <PowerUserIcon key={i} className="h-4 w-4 shrink-0" width={16} height={16} />;
                    case Source.Lens:
                        return null;
                    default:
                        safeUnreachable(icon.source);
                        return null;
                }
            })}
        </div>
    );
}
