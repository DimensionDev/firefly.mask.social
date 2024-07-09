import { memo, type PropsWithChildren, useState } from 'react';

import { ProfileCard } from '@/components/Profile/ProfileCard.js';
import { TippyContext, useTippyContext } from '@/components/TippyContext/index.js';
import { type SocialSource } from '@/constants/enum.js';
import { Tippy } from '@/esm/Tippy.js';
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
    const [enabled, setEnabled] = useState(!isMedium);

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
                onTrigger={() => {
                    setEnabled(true);
                }}
                hideOnClick
                interactive
                content={enabled ? <ProfileCard source={source} profile={defaultProfile} identity={identity} /> : null}
            >
                <span className={className}>{children}</span>
            </Tippy>
        </TippyContext.Provider>
    );
});
