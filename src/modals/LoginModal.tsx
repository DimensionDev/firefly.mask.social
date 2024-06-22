'use client';

import { Trans } from '@lingui/macro';
import { delay, safeUnreachable } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { EMPTY_LIST } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, Suspense, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { BackButton } from '@/components/BackButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { LoginButton } from '@/components/Login/LoginButton.js';
import { LoginFarcaster } from '@/components/Login/LoginFarcaster.js';
import { LoginFirefly } from '@/components/Login/LoginFirefly.js';
import { LoginLens } from '@/components/Login/LoginLens.js';
import { LoginTwitter } from '@/components/Login/LoginTwitter.js';
import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import { queryClient } from '@/configs/queryClient.js';
import { config } from '@/configs/wagmiClient.js';
import { FarcasterSignType, type ProfileSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface LoginModalProps {
    source?: ProfileSource;
}

export const LoginModal = forwardRef<SingletonModalRefCreator<LoginModalProps | void>>(function LoginModal(_, ref) {
    const isMedium = useIsMedium();

    // shared
    const [source, setSource] = useState<ProfileSource | null>(null);

    // for lens only
    const [profiles, setProfiles] = useState<Profile[]>(EMPTY_LIST);
    const [currentAccount, setCurrentAccount] = useState('');

    // for farcaster only
    const [signType, setSignType] = useState<FarcasterSignType | null>(null);

    const [{ loading }, handleLogin] = useAsyncFn(async (selectedSource: ProfileSource) => {
        try {
            switch (selectedSource) {
                case Source.Lens: {
                    const { account } = await getWalletClientRequired(config);
                    const profiles = await queryClient.fetchQuery({
                        queryKey: ['lens', 'profiles', account.address],
                        queryFn: async () => {
                            if (!account.address) return EMPTY_LIST;
                            return LensSocialMediaProvider.getProfilesByAddress(account.address);
                        },
                    });
                    if (!profiles.length) {
                        enqueueErrorMessage(
                            <div>
                                <span className="font-bold">
                                    <Trans>Wrong wallet</Trans>
                                </span>
                                <br />
                                <Trans>No Lens profile was found. Please try using a different wallet.</Trans>
                            </div>,
                        );
                        return;
                    }

                    setProfiles(profiles);
                    setCurrentAccount(account.address);
                    setSource(selectedSource);
                    return;
                }
                case Source.Farcaster:
                    setSignType(null);
                    setSource(selectedSource);
                    return;
                case Source.Twitter:
                    setSource(selectedSource);
                    return;
                case Source.Firefly:
                    setSource(selectedSource);
                    return;
                default:
                    safeUnreachable(selectedSource);
                    return;
            }
        } catch (error) {
            enqueueErrorMessage(
                <div>
                    <span className="font-bold">
                        <Trans>Connection failed</Trans>
                    </span>
                    <br />
                    <Trans>The user declined the request.</Trans>
                </div>,
                {
                    noReport: true,
                },
            );
            throw error;
        }
    }, []);

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: async (props) => {
            if (!props?.source) return;
            await handleLogin(props.source);
        },
        onClose: async () => {
            // setSource will trigger a re-render, so we need to delay the setSource(null) to avoid the re-render
            await delay(300);
            setSource(null);
        },
    });

    const content = !source ? (
        <div
            className="flex flex-col rounded-[12px] bg-primaryBottom md:w-[600px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="flex w-full flex-col md:gap-4 md:p-4">
                {loading ? (
                    <div className="flex h-[324px] w-full items-center justify-center">
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                    </div>
                ) : (
                    <>
                        <div className="flex w-full flex-row md:gap-4">
                            {SORTED_SOCIAL_SOURCES.map((source) => (
                                <LoginButton key={source} source={source} onClick={() => handleLogin(source)} />
                            ))}
                        </div>
                        <LoginButton source={Source.Firefly} onClick={() => handleLogin(Source.Firefly)} />
                    </>
                )}
            </div>
        </div>
    ) : (
        <Suspense
            fallback={
                <div className="flex h-[150px] items-center justify-center md:h-[194px] md:w-[600px]">
                    <LoadingIcon className="animate-spin" width={24} height={24} />
                </div>
            }
        >
            {source === Source.Lens ? <LoginLens profiles={profiles} currentAccount={currentAccount} /> : null}
            {source === Source.Farcaster ? <LoginFarcaster signType={signType} setSignType={setSignType} /> : null}
            {source === Source.Twitter ? <LoginTwitter /> : null}
            {source === Source.Firefly && isMedium ? <LoginFirefly /> : null}
        </Suspense>
    );

    return isMedium ? (
        <Modal open={open} onClose={() => dispatch?.close()}>
            <div className="transform rounded-[12px] bg-bgModal transition-all">
                <div
                    className="inline-flex items-center justify-center gap-2 rounded-t-[12px] p-4 md:h-[56px] md:w-[600px]"
                    style={{ background: 'var(--m-modal-title-bg)' }}
                >
                    {source ? (
                        <BackButton
                            onClick={() => {
                                if (signType) setSignType(null);
                                else setSource(null);
                            }}
                        />
                    ) : (
                        <CloseButton onClick={() => dispatch?.close()} />
                    )}

                    <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                        {source === Source.Lens ? (
                            <Trans>Select Account</Trans>
                        ) : source === Source.Farcaster ? (
                            <Trans>Log in to Farcaster account</Trans>
                        ) : source === Source.Firefly ? (
                            <Trans>Login with QR Code</Trans>
                        ) : (
                            <Trans>Login</Trans>
                        )}
                    </div>
                    <div className="relative h-6 w-6" />
                </div>
                {content}
            </div>
        </Modal>
    ) : (
        <Popover open={open} onClose={() => dispatch?.close()}>
            {content}
        </Popover>
    );
});
