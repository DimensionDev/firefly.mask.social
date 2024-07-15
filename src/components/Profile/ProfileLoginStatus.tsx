import { Trans } from '@lingui/macro';
import type { HTMLProps } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { switchAccount } from '@/helpers/account.js';
import { classNames } from '@/helpers/classNames.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileLoginStatusProps extends HTMLProps<HTMLDivElement> {
    profile: Profile;
}

function getButtonClassName(...rest: string[]) {
    return classNames('h-8 rounded-[20px] border border-lightMain px-5 text-[15px] font-bold leading-[30px]', ...rest);
}

export function ProfileLoginStatus({ profile, className = '' }: ProfileLoginStatusProps) {
    const { accounts, currentProfile } = useProfileStore(profile.source);

    // current active profile
    if (isSameProfile(profile, currentProfile)) return null;

    const relatedAccount = accounts.find((account) => isSameProfile(account.profile, profile));

    // has other accounts connected
    if (relatedAccount) {
        return (
            <ClickableButton
                className={getButtonClassName('text-lightMain', className)}
                onClick={() => switchAccount(relatedAccount)}
            >
                <Trans>Switch</Trans>
            </ClickableButton>
        );
    }

    // try login new account
    return (
        <ClickableButton
            className={getButtonClassName('bg-main text-primaryBottom', className)}
            onClick={() => LoginModalRef.open({ source: profile.source, expectProfile: profile })}
        >
            <Trans>Login</Trans>
        </ClickableButton>
    );
}
