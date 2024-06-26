import { useQuery } from '@tanstack/react-query';
import { memo, type PropsWithChildren, useState } from 'react';

import { ProfileCard } from '@/components/Profile/ProfileCard.js';
import { TippyContext, useTippyContext } from '@/components/TippyContext/index.js';
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
    const [enabled, setEnabled] = useState(false);
    const isMedium = useIsMedium();

    const { data: profile, isLoading } = useQuery({
        enabled: !!identity && !!source && isMedium && enabled,
        queryKey: ['profile', source, identity],
        queryFn: async () => {
            if (defaultProfile) return defaultProfile;
            if (!identity || !source) return;
            const provider = resolveSocialMediaProvider(source);
            return source === Source.Lens ? provider.getProfileByHandle(identity) : provider.getProfileById(identity);
        },
    });

    const insideTippy = useTippyContext();
    if (!isMedium || !children || insideTippy) return children;

    return (
        <TippyContext.Provider value>
            <Tippy
                appendTo={() => document.body}
                maxWidth={350}
                className="tippy-card"
                placement="bottom"
                duration={500}
                delay={500}
                arrow={false}
                trigger="mouseenter"
                onShow={() => {
                    setEnabled(true);
                }}
                hideOnClick
                interactive
                content={<ProfileCard profile={profile} loading={isLoading} />}
            >
                <span className={className}>{children}</span>
            </Tippy>
        </TippyContext.Provider>
    );
});
