'use client';

import { Trans } from '@lingui/macro';
import { Reorder } from 'framer-motion';
import { noop, sortBy } from 'lodash-es';
import { usePathname } from 'next/navigation.js';
import { useMount } from 'react-use';
import urlcat from 'urlcat';

import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { PageRoute, type SocialSource, Source } from '@/constants/enum.js';
import { switchAccount } from '@/helpers/account.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { useUpdateParams } from '@/hooks/useUpdateParams.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { useProfileTabState } from '@/store/useProfileTabStore.js';

interface ProfileSettingsProps {
    source: SocialSource;
    onClose?: () => void;
}

export function ProfileSettings({ source, onClose }: ProfileSettingsProps) {
    const { accounts, currentProfile } = useProfileStore(source);
    const pathname = usePathname();
    const updateParams = useUpdateParams();
    const { profileTab } = useProfileTabState();

    const isPureProfilePage = pathname === PageRoute.Profile;
    const isMyProfilePage =
        !!profileTab.isMyProfile && (isPureProfilePage || isRoutePathname(pathname, PageRoute.Profile));

    useMount(() => {
        getProfileState(source).refreshAccounts();
    });

    if (!currentProfile) return null;

    /* the selected account goes first */
    const sortedAccounts = sortBy(accounts, (x) => (isSameProfile(x.profile, currentProfile) ? -1 : 0));

    return (
        <div className="flex flex-col overflow-x-hidden bg-primaryBottom md:w-[290px] md:rounded-2xl md:border md:border-line">
            <Reorder.Group
                values={sortedAccounts}
                draggable="false"
                onReorder={noop}
                className="no-scrollbar max-h-[calc(62.5px*3.5)] overflow-auto md:max-h-[calc(72px*3.5)]"
            >
                {sortedAccounts.map((account) => (
                    <Reorder.Item
                        key={account.profile.profileId}
                        value={account.profile.profileId}
                        dragListener={false}
                    >
                        <ClickableButton
                            className="flex w-full min-w-0 items-center justify-between gap-3 rounded px-2 py-2 hover:bg-bg md:rounded-none md:px-5"
                            onClick={async () => {
                                await switchAccount(account);
                                if (
                                    isMyProfilePage &&
                                    profileTab.source === source &&
                                    profileTab.identity !== resolveProfileId(account.profile)
                                ) {
                                    updateParams(
                                        new URLSearchParams({
                                            source: resolveSourceInURL(account.profile.source),
                                        }),
                                        isPureProfilePage
                                            ? undefined
                                            : urlcat('/profile/:id', { id: resolveProfileId(account.profile) }),
                                    );
                                }
                            }}
                        >
                            <ProfileAvatar profile={account.profile} clickable linkable />
                            <ProfileName profile={account.profile} />
                            {isSameProfile(account.profile, currentProfile) ? (
                                <CircleCheckboxIcon checked className="flex-shrink-0" />
                            ) : null}
                        </ClickableButton>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

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
