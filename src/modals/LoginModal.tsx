'use client';

import { Trans } from '@lingui/macro';
import { delay, getEnumAsArray, safeUnreachable } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useSnackbar } from 'notistack';
import { forwardRef, Suspense, useState } from 'react';
import { useAsyncFn } from 'react-use';

import CloseIcon from '@/assets/close.svg';
import LeftArrowIcon from '@/assets/left-arrow.svg';
import LoadingIcon from '@/assets/loading.svg';
import { LoginButton } from '@/components/Login/LoginButton.js';
import { LoginFarcaster } from '@/components/Login/LoginFarcaster.js';
import { LoginLens } from '@/components/Login/LoginLens.js';
import { Modal } from '@/components/Modal.js';
import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface LoginModalProps {
    source?: SocialPlatform;
}

export const LoginModal = forwardRef<SingletonModalRefCreator<LoginModalProps | void>>(function LoginModal(_, ref) {
    const [source, setSource] = useState<SocialPlatform>();
    const [profiles, setProfiles] = useState<Profile[]>(EMPTY_LIST);
    const [isDirectly, setIsDirectly] = useState(false);
    const [currentAccount, setCurrentAccount] = useState<string>('');

    const { enqueueSnackbar } = useSnackbar();

    const [{ loading }, handleLogin] = useAsyncFn(
        async (selectedSource: SocialPlatform) => {
            try {
                switch (selectedSource) {
                    case SocialPlatform.Lens: {
                        const { account } = await getWalletClientRequired();
                        const profiles = await queryClient.fetchQuery({
                            queryKey: ['lens', 'profiles', account.address],
                            queryFn: async () => {
                                if (!account.address) return EMPTY_LIST;
                                return LensSocialMediaProvider.getProfilesByAddress(account.address);
                            },
                        });
                        if (!profiles.length) {
                            enqueueSnackbar(
                                <div>
                                    <span className="font-bold">
                                        <Trans>Wrong wallet</Trans>
                                    </span>
                                    <br />
                                    <Trans>No Lens profile was found. Please try using a different wallet.</Trans>
                                </div>,
                                {
                                    variant: 'error',
                                },
                            );
                            return;
                        }
                        setProfiles(profiles);
                        setCurrentAccount(account.address);
                        setSource(selectedSource);
                        return;
                    }
                    case SocialPlatform.Farcaster:
                        setProfiles(EMPTY_LIST);
                        setSource(selectedSource);
                        return;
                    default:
                        safeUnreachable(selectedSource);
                        return;
                }
            } catch (error) {
                enqueueSnackbar(
                    <div>
                        <span className="font-bold">
                            <Trans>Connection failed</Trans>
                        </span>
                        <br />
                        <Trans>The user declined the request.</Trans>
                    </div>,
                    {
                        variant: 'error',
                    },
                );
            }
        },
        [enqueueSnackbar],
    );

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: async (props) => {
            if (props?.source) {
                await handleLogin(props.source);
                setIsDirectly(true);
            }
        },
        onClose: async () => {
            // setSource will trigger a re-render, so we need to delay the setSource(undefined) to avoid the re-render
            await delay(500);
            setIsDirectly(false);
            setSource(undefined);
        },
    });

    return (
        <Modal open={open} onClose={() => dispatch?.close()}>
            <div
                className="inline-flex h-[56px] w-[600px] items-center justify-center gap-2 rounded-t-[12px] p-4"
                style={{ background: 'var(--m-modal-title-bg)' }}
            >
                <button
                    onClick={() => {
                        source === SocialPlatform.Farcaster && !isDirectly ? setSource(undefined) : dispatch?.close();
                    }}
                >
                    {source === SocialPlatform.Farcaster && !isDirectly ? (
                        <LeftArrowIcon width={24} height={24} />
                    ) : (
                        <CloseIcon width={24} height={24} />
                    )}
                </button>
                <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                    {source === SocialPlatform.Lens ? (
                        <Trans>Select Account</Trans>
                    ) : source === SocialPlatform.Farcaster ? (
                        <Trans>Log in to Farcaster account</Trans>
                    ) : (
                        <Trans>Login</Trans>
                    )}
                </div>
                <div className="relative h-6 w-6" />
            </div>
            {!source ? (
                <div
                    className="flex w-[600px] flex-col rounded-[12px]"
                    style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
                >
                    <div className="flex w-full flex-col gap-4 p-4 ">
                        {loading ? (
                            <div className="flex h-[324px] w-full items-center justify-center">
                                <LoadingIcon className="animate-spin" width={24} height={24} />
                            </div>
                        ) : (
                            getEnumAsArray(SocialPlatform).map(({ value: source }) => (
                                <LoginButton key={source} source={source} onClick={() => handleLogin(source)} />
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <Suspense
                    fallback={
                        <div className="flex h-[194px] w-[600px] items-center justify-center">
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        </div>
                    }
                >
                    {source === SocialPlatform.Lens ? (
                        <LoginLens profiles={profiles} currentAccount={currentAccount} />
                    ) : null}
                    {source === SocialPlatform.Farcaster ? <LoginFarcaster /> : null}
                </Suspense>
            )}
        </Modal>
    );
});
