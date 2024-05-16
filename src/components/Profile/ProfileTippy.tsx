import { useQuery } from '@tanstack/react-query';
import { memo, type PropsWithChildren } from 'react';

import { ProfileCard } from '@/components/Profile/ProfileCard.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Tippy } from '@/esm/Tippy.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

export interface ProfileTippyProps extends PropsWithChildren {
    identity: string;
    source: SocialSource;
    className?: string;
}

export const ProfileTippy = memo<ProfileTippyProps>(function ProfileTippy({ identity, source, children, className }) {
    const isMedium = useIsMedium();

    const { data: profile = null, isLoading } = useQuery({
        enabled: !!identity && !!source && isMedium,
        queryKey: ['profile', source, identity],
        queryFn: async () => {
            if (!identity || !source) return;
            const provider = resolveSocialMediaProvider(source);
            return source === Source.Lens ? provider.getProfileByHandle(identity) : provider.getProfileById(identity);
        },
    });

    if (!isMedium || !children || !profile) return children;

    return (
        <Tippy
            appendTo={() => document.body}
            maxWidth={400}
            offset={[-100, 0]}
            className="tippy-card"
            placement="bottom"
            duration={500}
            arrow={false}
            trigger="mouseenter"
            hideOnClick
            interactive
            content={<ProfileCard profile={profile} loading={isLoading} />}
        >
            <div className={className}>{children}</div>
        </Tippy>
    );
});
