'use client';

import { Trans } from '@lingui/macro';
import { signOut } from 'next-auth/react';
import { useMount } from 'react-use';

import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { switchAccount } from '@/helpers/account.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';

function AccountButtonInList({ account, selected = false }: { account: Account; selected?: boolean }) {
    return (
        <ClickableButton
            className="flex w-full min-w-0 items-center justify-between gap-3 rounded px-2 py-2 hover:bg-bg md:rounded-none md:px-5"
            key={account.profile.profileId}
            onClick={() => {
                switchAccount(account);
            }}
        >
            <ProfileAvatar profile={account.profile} clickable linkable />
            <ProfileName profile={account.profile} />
            {selected ? <CircleCheckboxIcon checked /> : null}
        </ClickableButton>
    );
}

interface ProfileSettingsProps {
    source: SocialSource;
    onClose?: () => void;
}

export function ProfileSettings({ source, onClose }: ProfileSettingsProps) {
    const { accounts, currentProfile } = useProfileStore(source);

    useMount(() => {
        getProfileState(source).refreshAccounts();
    });

    if (!currentProfile) return null;

    const selectedAccount = accounts.find((x) => isSameProfile(x.profile, currentProfile));

    return (
        <div className="flex flex-col overflow-x-hidden bg-primaryBottom md:w-[290px] md:rounded-2xl md:border md:border-line">
            <div className="max-h-[calc(62.5px*3)] overflow-auto md:max-h-[calc(72px*3)]">
                {/* the selected account goes first */}
                {selectedAccount ? <AccountButtonInList account={selectedAccount} selected /> : null}
                {accounts
                    .filter((x) => !isSameProfile(x.profile, currentProfile))
                    .map((account, index) => (
                        <ClickableButton
                            className="flex w-full min-w-0 items-center justify-between gap-3 rounded px-2 py-2 hover:bg-bg md:rounded-none md:px-5"
                            key={account.profile.profileId}
                            onClick={() => {
                                switchAccount(account);
                            }}
                        >
                            <ProfileAvatar profile={account.profile} clickable linkable />
                            <ProfileName profile={account.profile} />
                            {isSameProfile(account.profile, currentProfile) ? <CircleCheckboxIcon checked /> : null}
                        </ClickableButton>
                    ))}
            </div>

            <hr className="mb-3 border-b border-t-0 border-line" />

            <div className="flex flex-col md:mx-5">
                {source !== Source.Twitter ? (
                    <ClickableButton
                        className="flex w-full items-center rounded px-2 py-3 text-main hover:bg-bg"
                        onClick={async () => {
                            LoginModalRef.open({ source });
                            onClose?.();
                        }}
                    >
                        <span className="text-[17px] font-bold leading-[22px] text-main">
                            <Trans>Connect another account</Trans>
                        </span>
                    </ClickableButton>
                ) : null}
                <ClickableButton
                    className="flex items-center overflow-hidden whitespace-nowrap rounded px-2 py-3 hover:bg-bg md:mb-3"
                    onClick={() => {
                        LogoutModalRef.open({
                            account: accounts.find((x) => isSameProfile(x.profile, currentProfile)),
                        });
                        onClose?.();
                    }}
                >
                    <span className="text-[17px] font-bold leading-[22px] text-danger">
                        <Trans>Log out @{currentProfile.handle}</Trans>
                    </span>
                </ClickableButton>
            </div>
        </div>
    );
}
