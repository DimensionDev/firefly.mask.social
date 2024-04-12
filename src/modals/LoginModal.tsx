'use client';

import { Trans } from '@lingui/macro';
import { delay, safeUnreachable } from '@masknet/kit';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, Suspense, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { LoginButton } from '@/components/Login/LoginButton.js';
import { LoginFarcaster } from '@/components/Login/LoginFarcaster.js';
import { LoginLens } from '@/components/Login/LoginLens.js';
import { LoginTwitter } from '@/components/Login/LoginTwitter.js';
import { Modal } from '@/components/Modal.js';
import { Popover } from '@/components/Popover.js';
import { queryClient } from '@/configs/queryClient.js';
import { config } from '@/configs/wagmiClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST, SORTED_SOURCES } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface LoginModalProps {
    source?: SocialPlatform;
}

export const LoginModal = forwardRef<SingletonModalRefCreator<LoginModalProps | void>>(function LoginModal(_, ref) {
    const isMedium = useIsMedium();

    const [source, setSource] = useState<SocialPlatform>();
    const [profiles, setProfiles] = useState<Profile[]>(EMPTY_LIST);
    const [isDirectly, setIsDirectly] = useState(false);
    const [currentAccount, setCurrentAccount] = useState<string>('');

    const [{ loading }, handleLogin] = useAsyncFn(async (selectedSource: SocialPlatform) => {
        try {
            switch (selectedSource) {
                case SocialPlatform.Lens: {
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
                case SocialPlatform.Farcaster:
                    setProfiles(EMPTY_LIST);
                    setSource(selectedSource);
                    return;
                case SocialPlatform.Twitter:
                    setProfiles(EMPTY_LIST);
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
            );
        }
    }, []);

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: async (props) => {
            if (!props?.source) return;
            await handleLogin(props.source);
            setIsDirectly(true);
        },
        onClose: async () => {
            // setSource will trigger a re-render, so we need to delay the setSource(undefined) to avoid the re-render
            await delay(300);
            setIsDirectly(false);
            setSource(undefined);
        },
    });

    const content = !source ? (
        <div
            className="flex flex-col rounded-[12px] md:w-[600px]"
            style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
        >
            <div className="flex w-full flex-col md:gap-4 md:p-4">
                {loading ? (
                    <div className="flex h-[324px] w-full items-center justify-center">
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                    </div>
                ) : (
                    SORTED_SOURCES.map((source) => (
                        <LoginButton key={source} source={source} onClick={() => handleLogin(source)} />
                    ))
                )}
            </div>
        </div>
    ) : (
        <Suspense
            fallback={
                <div className="flex items-center justify-center md:h-[194px] md:w-[600px]">
                    <LoadingIcon className="animate-spin" width={24} height={24} />
                </div>
            }
        >
            {source === SocialPlatform.Lens ? <LoginLens profiles={profiles} currentAccount={currentAccount} /> : null}
            {source === SocialPlatform.Farcaster ? <LoginFarcaster /> : null}
            {source === SocialPlatform.Twitter ? <LoginTwitter /> : null}
        </Suspense>
    );

    return isMedium ? (
        <Modal open={open} onClose={() => dispatch?.close()}>
            <div className=" transform rounded-[12px] bg-bgModal transition-all">
                <div
                    className="inline-flex items-center justify-center gap-2 rounded-t-[12px] p-4 md:h-[56px] md:w-[600px]"
                    style={{ background: 'var(--m-modal-title-bg)' }}
                >
                    {source === SocialPlatform.Farcaster && !isDirectly ? (
                        <ClickableButton onClick={() => setSource(undefined)}>
                            <LeftArrowIcon width={24} height={24} />
                        </ClickableButton>
                    ) : (
                        <CloseButton onClick={() => dispatch?.close()} />
                    )}

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
                {content}
            </div>
        </Modal>
    ) : (
        <Popover open={open} onClose={() => dispatch?.close()}>
            {content}
        </Popover>
    );
});
