'use client';

import { Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { Reorder } from 'framer-motion';
import { noop } from 'lodash-es';
import { usePathname } from 'next/navigation.js';
import { useAsyncFn, useMount } from 'react-use';
import urlcat from 'urlcat';

import LogoutIcon from '@/assets/logout.svg';
import UserAddIcon from '@/assets/user-add.svg';
import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { PageRoute, type SocialSource, Source } from '@/constants/enum.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { useUpdateParams } from '@/hooks/useUpdateParams.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';
import { switchAccount } from '@/services/account.js';
import { useFireflyIdentityState } from '@/store/useFireflyIdentityStore.js';

interface ProfileSettingsProps {
    source: SocialSource;
    onClose?: () => void;
}

export function ProfileSettings({ source, onClose }: ProfileSettingsProps) {
    const { currentProfile } = useProfileStore(source);
    const pathname = usePathname();
    const updateParams = useUpdateParams();
    const { identity } = useFireflyIdentityState();
    const accounts = useConnectedAccounts(source);

    const isMyProfile = useIsMyRelatedProfile(identity.source, identity.id);
    const isPureProfilePage = pathname === PageRoute.Profile;
    const isMyProfilePage = isMyProfile && (isPureProfilePage || isRoutePathname(pathname, PageRoute.Profile));

    useMount(() => {
        getProfileState(source).refreshAccounts();
    });

    const [{ loading }, onSwitchAccount] = useAsyncFn(async (account: Account) => {
        if (!account.session) {
            onClose?.();
            await delay(300);
            LoginModalRef.open({
                source,
                options: { expectedProfile: account.profile.profileId },
            });
            return;
        }
        await switchAccount({ ...account, session: account.session });
        if (isMyProfilePage && identity.source === source && identity.id !== resolveFireflyProfileId(account.profile)) {
            updateParams(
                new URLSearchParams({
                    source: resolveSourceInUrl(account.profile.source),
                }),
                isPureProfilePage
                    ? undefined
                    : urlcat('/profile/:id', { id: resolveFireflyProfileId(account.profile) }),
            );
        }
    }, []);

    if (!currentProfile) return null;

    return (
        <div className="mt-3 flex flex-col overflow-x-hidden bg-primaryBottom md:mt-0 md:w-[290px] md:rounded-2xl md:p-6 md:shadow-lightS3">
            <Reorder.Group
                values={accounts}
                draggable="false"
                onReorder={noop}
                className="no-scrollbar max-h-[calc(62.5px*4.5)] space-y-3 overflow-auto md:max-h-[calc(72px*7.5)]"
            >
                {accounts.map((account) => (
                    <Reorder.Item
                        key={account.profile.profileId}
                        value={account.profile.profileId}
                        dragListener={false}
                    >
                        <ClickableButton
                            className="flex w-full min-w-0 items-center justify-between gap-3 rounded md:rounded-none"
                            disabled={loading}
                            onClick={() => onSwitchAccount(account)}
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

            <div className="mt-3 flex flex-col space-y-3">
                {source !== Source.Twitter ? (
                    <ClickableButton
                        className="flex h-6 w-full items-center whitespace-nowrap rounded leading-6 text-main"
                        onClick={() => {
                            LoginModalRef.open({ source });
                            onClose?.();
                        }}
                    >
                        <UserAddIcon width={24} height={24} className="mr-2 h-6 w-6 shrink-0" />
                        <span className="w-full text-left text-[17px] font-bold leading-[22px] text-main">
                            <Trans>Add an existing account</Trans>
                        </span>
                    </ClickableButton>
                ) : null}
                <ClickableButton
                    className="flex h-6 items-center overflow-hidden whitespace-nowrap rounded leading-6"
                    onClick={() => {
                        LogoutModalRef.open({
                            account: accounts.find((x) => isSameProfile(x.profile, currentProfile)),
                        });
                        onClose?.();
                    }}
                >
                    <LogoutIcon width={24} height={24} className="mr-2 h-6 w-6 shrink-0" />
                    <span className="w-full truncate text-left text-[17px] font-bold leading-[22px] text-main">
                        <Trans>Log out @{currentProfile.handle}</Trans>
                    </span>
                </ClickableButton>
            </div>
        </div>
    );
}
