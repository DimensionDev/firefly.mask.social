import { useQuery } from '@tanstack/react-query';
import { memo, type PropsWithChildren } from 'react';

import { ProfileCard } from '@/components/Profile/ProfileCard.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Tippy } from '@/esm/Tippy.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface ProfileTippyProps extends PropsWithChildren {
    identity: string;
    source: SocialSource;
    className?: string;
    profile?: Profile;
}

export const ProfileTippy = memo<ProfileTippyProps>(function ProfileTippy({
    identity,
    source,
    children,
    className,
    profile: defaultProfile,
}) {
    const isMedium = useIsMedium();

    const { data: profile, isLoading } = useQuery({
        enabled: !!identity && !!source && isMedium,
        queryKey: ['profile', source, identity],
        initialData: defaultProfile,
        queryFn: async () => {
            if (!identity || !source) return;
            const provider = resolveSocialMediaProvider(source);
            return source === Source.Lens ? provider.getProfileByHandle(identity) : provider.getProfileById(identity);
        },
    });

    if (!isMedium || !children) return children;

    return (
        <Tippy
            appendTo={() => document.body}
            maxWidth={350}
            className="tippy-card"
            placement="bottom"
            duration={500}
            delay={500}
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
