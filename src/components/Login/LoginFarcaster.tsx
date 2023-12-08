'use client';

import { t, Trans } from '@lingui/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import QRCode from 'react-qr-code';

import LoadingIcon from '@/assets/loading.svg';
import { LoginModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';

export function LoginFarcaster() {
    const [url, setUrl] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const updateProfiles = useFarcasterStateStore.use.updateProfiles();
    const updateCurrentProfile = useFarcasterStateStore.use.updateCurrentProfile();

    useSuspenseQuery<string>({
        queryKey: ['farcaster', 'login'],
        queryFn: async () => {
            try {
                const session = await WarpcastSocialMediaProvider.createSessionByCustodyWallet();
                const profile = await FireflySocialMediaProvider.getProfileById(`${session.profileId}`);

                updateProfiles([profile]);
                updateCurrentProfile(profile, session);

                enqueueSnackbar(t`Your Farcaster account is now connected`, {
                    variant: 'success',
                });
                LoginModalRef.close();
            } catch (error) {
                enqueueSnackbar(error instanceof Error ? error.message : t`Failed to login`, {
                    variant: 'error',
                });
                LoginModalRef.close();
            }

            return '';
        },
    });

    return (
        <div
            className="flex w-[600px] flex-col rounded-[12px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="flex min-h-[475px] w-full flex-col items-center gap-[16px] p-[16px] ">
                {url ? (
                    <>
                        <div className=" text-center text-[12px] leading-[16px] text-lightSecond">
                            <Trans>On your mobile device with Warpcast, open the Camera app and scan the QR code</Trans>
                        </div>
                        <QRCode value={url} size={360} />
                    </>
                ) : (
                    <div className="flex w-full flex-1 flex-col items-center justify-center">
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                    </div>
                )}
            </div>
        </div>
    );
}
