'use client';

import { Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation.js';
import { useMemo } from 'react';
import { useAsync } from 'react-use';

import FullLogo from '@/assets/logo-full.svg';
import { Loading } from '@/components/Loading.js';
import { OpenFireflyAppButton } from '@/components/OpenFireflyAppButton.js';
import { Source } from '@/constants/enum.js';
import { isSameSession } from '@/helpers/isSameSession.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { ThirdPartySession } from '@/providers/third-party/Session.js';
import { ProfileStatus, SessionType } from '@/providers/types/SocialMedia.js';
import { addAccount } from '@/services/account.js';
import { bindOrRestoreFireflySession } from '@/services/bindFireflySession.js';
import { useThirdPartyStateStore } from '@/store/useProfileStore.js';
import { DeviceType } from '@/types/device.js';

interface PageProps {
    searchParams: { token?: string; os?: string };
}

export default function Page({ searchParams }: PageProps) {
    const router = useRouter();
    const schemes = useMemo(() => {
        const token = searchParams.token;
        if (!token) return;
        return {
            [DeviceType.IOS]: `firefly://authentication/telegram/callback?token=${token}`,
            [DeviceType.Android]: `firefly://authentication/telegram/callback?token=${token}`,
        };
    }, [searchParams]);

    const { loading } = useAsync(async () => {
        const os = searchParams.os;
        const token = searchParams.token;

        if (os === 'web' && token) {
            const data = await FireflyEndpointProvider.loginTelegram(token);

            if (!data) return;

            const accounts = useThirdPartyStateStore.getState().accounts;

            const thirdPartySession = new ThirdPartySession(
                SessionType.Telegram,
                data.telegram_user_id,
                token,
                Date.now(),
                dayjs(Date.now()).add(1, 'y').unix(),
                '',
                data.accessToken,
                data.accountId,
            );

            const foundNewSessionFromServer = !!(
                thirdPartySession &&
                !accounts.some((x) => isSameSession(thirdPartySession, x.session as ThirdPartySession))
            );

            await addAccount(
                {
                    profile: {
                        profileId: data.telegram_user_id,
                        displayName: data.telegram_username,
                        handle: data.telegram_username,
                        fullHandle: data.telegram_username,
                        pfp: '',
                        followerCount: 0,
                        followingCount: 0,
                        status: ProfileStatus.Active,
                        source: Source.Farcaster,
                        profileSource: Source.Telegram,
                        verified: true,
                    },
                    session: thirdPartySession,
                    fireflySession: foundNewSessionFromServer
                        ? await bindOrRestoreFireflySession(thirdPartySession, undefined, {
                              isNew: data.isNew,
                              accountId: data.accountId,
                              token: data.accessToken,
                          })
                        : undefined,
                },
                {
                    skipBelongsToCheck: !foundNewSessionFromServer,
                    skipResumeFireflyAccounts: !foundNewSessionFromServer,
                    skipResumeFireflySession: !foundNewSessionFromServer,
                    skipUploadFireflySession: !foundNewSessionFromServer,
                },
            );

            router.replace('/');
        }
    }, [searchParams]);

    if (loading && searchParams.os === 'web') {
        return (
            <div className="absolute inset-0 flex flex-col items-center gap-[178px] bg-white pt-20 dark:bg-black md:pt-[124px]">
                <Loading />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 flex flex-col items-center gap-[178px] bg-white pt-20 dark:bg-black md:pt-[124px]">
            <FullLogo width={240} height={240} className="text-black dark:text-white" />
            <div className="w-full px-9 md:max-w-[311px] md:px-0">
                <OpenFireflyAppButton
                    className="w-full rounded-xl bg-black px-5 py-2 text-center text-xl font-bold text-white dark:bg-white dark:text-[#181A20]"
                    schemes={schemes}
                >
                    <Trans>Open in Firefly App</Trans>
                </OpenFireflyAppButton>
            </div>
        </div>
    );
}
