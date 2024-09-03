'use client';

import { delay } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import { ProfileAvatarAdd } from '@/components/Login/ProfileAvatarAdd.js';
import { ProfileAvatarInteractive } from '@/components/Login/ProfileAvatarInteractive.js';
import { config } from '@/configs/wagmiClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { LoginModalRef } from '@/modals/controls.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface LoginStatusBarProps {
    collapsed?: boolean;
}

export function LoginStatusBar({ collapsed = false }: LoginStatusBarProps) {
    const { updateSidebarOpen } = useNavigatorState();

    const currentProfileAll = useCurrentProfileAll();

    const [{ loading }, onLogin] = useAsyncFn(async (source: SocialSource) => {
        updateSidebarOpen(false);
        await delay(300);
        if (source === Source.Lens) await getWalletClientRequired(config);
        LoginModalRef.open({ source });
    }, []);

    return (
        <div
            className={classNames('relative flex', {
                'flex-col justify-center gap-y-2': collapsed,
                'flex-row justify-start gap-x-2 pl-6 lg:pl-2': !collapsed,
            })}
        >
            {SORTED_SOCIAL_SOURCES.map((x) => {
                const currentProfile = currentProfileAll[x];
                return currentProfile ? <ProfileAvatarInteractive key={x} profile={currentProfile} /> : null;
            })}

            {SORTED_SOCIAL_SOURCES.map((x) =>
                !currentProfileAll[x] ? (
                    <ProfileAvatarAdd key={x} source={x} loading={loading} onClick={() => onLogin(x)} />
                ) : null,
            )}
        </div>
    );
}
