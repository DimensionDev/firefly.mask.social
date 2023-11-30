'use client';

import { Trans } from '@lingui/macro';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { useAsync } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { SocialPlatform } from "@/constants/enum.js";
import { LoginModalRef } from '@/modals/controls.js';
import { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';

export function LoginFarcaster() {
    const [url, setUrl] = useState('');
    const updateAccounts = useFarcasterStateStore.use.updateAccounts();
    const updateCurrentAccount = useFarcasterStateStore.use.updateCurrentAccount();

    useAsync(async () => {
        const fireflyProvider = new FireflySocialMedia();
        const session = await fireflyProvider.createSession(setUrl);
        const profile = await fireflyProvider.getProfileById(`${session.profileId}`);
        const account = {
            avatar: profile.pfp,
            name: profile.displayName,
            profileId: profile.profileId,
            id: profile.profileId,
            platform: SocialPlatform.Farcaster,
        };
        updateAccounts([account]);
        updateCurrentAccount(account);
        LoginModalRef.close();
    }, []);

    return (
        <div
            className="flex w-[600px] flex-col rounded-[12px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="flex min-h-[475px] w-full flex-col items-center gap-[16px] p-[16px] ">
                <div className=" text-center text-[12px] leading-[16px] text-lightSecond">
                    <Trans>
                        On your mobile device with Warpcast, open the Camera app and scan the QR code
                    </Trans>
                </div>
                {url ? (
                    <QRCode value={url} size={360} />
                ) : (
                    <div className="flex w-full flex-1 flex-col items-center justify-center">
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                    </div>
                )}
            </div>
        </div>
    );
}
