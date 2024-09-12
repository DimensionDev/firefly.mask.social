import { memo, useCallback } from 'react';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { Source } from '@/constants/enum.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef, SuperFollowModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface SuperFollowProps extends ClickableButtonProps {
    profile: Profile;
}

export const SuperFollow = memo<SuperFollowProps>(function SuperFollow({ profile, onClick, ...props }) {
    const isLogin = useIsLogin(Source.Lens);
    const openSuperFollowModal = useCallback(() => {
        onClick?.();
        if (!isLogin) {
            LoginModalRef.open({ source: Source.Lens });
            return;
        }

        SuperFollowModalRef.open({ profile });
    }, [profile, isLogin, onClick]);

    return <ClickableButton {...props} onClick={openSuperFollowModal} />;
});
