'use client';

import { delay } from '@masknet/kit';

import { ProfileAvatarAdd } from '@/components/Login/ProfileAvatarAdd.js';
import { ProfileAvatarInteractive } from '@/components/Login/ProfileAvatarInteractive.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SORTED_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { LoginModalRef } from '@/modals/controls.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

interface LoginStatusBarProps {
    collapsed?: boolean;
}

export function LoginStatusBar({ collapsed = false }: LoginStatusBarProps) {
    const { updateSidebarOpen } = useNavigatorState();

    const currentProfileAll = useCurrentProfileAll();

    return (
        <div
            className={classNames('relative flex', {
                'flex-col justify-center gap-y-2': collapsed,
                'flex-row justify-start gap-x-2 pl-6 lg:pl-2': !collapsed,
            })}
        >
            {SORTED_SOURCES.map((x) => {
                const currentProfile = currentProfileAll[x];
                return currentProfile ? <ProfileAvatarInteractive key={x} profile={currentProfile} /> : null;
            })}

            {SORTED_SOURCES.map((x) =>
                !currentProfileAll[x] ? (
                    <ProfileAvatarAdd
                        key={x}
                        source={x}
                        onClick={async () => {
                            updateSidebarOpen(false);
                            await delay(300);
                            if (x === SocialPlatform.Lens) await getWalletClientRequired();
                            LoginModalRef.open({ source: x });
                        }}
                    />
                ) : null,
            )}
        </div>
    );
}
