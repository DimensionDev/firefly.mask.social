import type { TippyProps } from '@tippyjs/react';
import { memo, useState } from 'react';

import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import { ProfileCard } from '@/components/Profile/ProfileCard.js';
import { TippyContext, useTippyContext } from '@/components/TippyContext/index.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileTippyProps extends TippyProps {
    className?: string;
    profile?: Profile;
    identity: FireflyIdentity;
}

export const ProfileTippy = memo<ProfileTippyProps>(function ProfileTippy({ identity, profile, children, ...rest }) {
    const isMedium = useIsMedium();
    const [enabled, setEnabled] = useState(!isMedium);

    const insideTippy = useTippyContext();
    if (!isMedium || !children || insideTippy) return children;

    return (
        <TippyContext.Provider value>
            <InteractiveTippy
                maxWidth={350}
                className="tippy-card"
                placement="bottom"
                onTrigger={() => {
                    setEnabled(true);
                }}
                content={enabled ? <ProfileCard identity={identity} defaultProfile={profile} /> : null}
                {...rest}
            >
                {children}
            </InteractiveTippy>
        </TippyContext.Provider>
    );
});
