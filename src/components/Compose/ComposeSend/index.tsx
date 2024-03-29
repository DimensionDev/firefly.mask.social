import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import { FireflyRedPacket } from '@masknet/web3-providers';
import { FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types';
import { useQueryClient } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import SendIcon from '@/assets/send.svg';
import Send2Icon from '@/assets/send2.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { useSendFarcaster } from '@/components/Compose/ComposeSend/useSendFarcaster.js';
import { useSendLens } from '@/components/Compose/ComposeSend/useSendLens.js';
import { CountdownCircle } from '@/components/Compose/CountdownCircle.js';
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { MAX_POST_SIZE, MAX_THREAD_SIZE } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { hasRedPacketPayload } from '@/helpers/hasRedPacketPayload.js';
import { measureChars } from '@/helpers/readChars.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

interface ComposeSendProps extends React.HTMLAttributes<HTMLDivElement> {
    post: CompositePost;
}

export function ComposeSend(props: ComposeSendProps) {
    const { type, posts, newPost } = useComposeStateStore();

    const { chars, images, video, availableSources } = props.post;

    const { length, visibleLength, invisibleLength } = measureChars(chars);

    const setEditorContent = useSetEditorContent();

    const isMedium = useIsMedium();
    const queryClient = useQueryClient();

    const sendLens = useSendLens();
    const sendFarcaster = useSendFarcaster();
    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const refreshProfileFeed = useCallback(
        async (source: SocialPlatform) => {
            switch (source) {
                case SocialPlatform.Lens:
                    await queryClient.invalidateQueries({
                        queryKey: ['getPostsByProfileId', SocialPlatform.Lens, currentLensProfile?.profileId],
                    });
                    queryClient.removeQueries({
                        queryKey: ['getPostsByProfileId', SocialPlatform.Lens, currentLensProfile?.profileId],
                    });
                    break;
                case SocialPlatform.Farcaster:
                    await queryClient.invalidateQueries({
                        queryKey: ['getPostsByProfileId', SocialPlatform.Farcaster, currentFarcasterProfile?.profileId],
                    });
                    queryClient.removeQueries({
                        queryKey: ['getPostsByProfileId', SocialPlatform.Farcaster, currentFarcasterProfile?.profileId],
                    });
                    break;
                default:
                    safeUnreachable(source);
                    return;
            }
        },
        [currentLensProfile, currentFarcasterProfile, queryClient],
    );
    const [{ loading }, handleSend] = useAsyncFn(async () => {
        if (type === 'compose') {
            const promises: Array<Promise<void>> = [];
            if (availableSources.includes(SocialPlatform.Lens)) promises.push(sendLens());
            if (availableSources.includes(SocialPlatform.Farcaster)) promises.push(sendFarcaster());

            const allSettled = await Promise.allSettled(promises);

            // If all requests fail, abort execution
            if (allSettled.every((x) => x.status === 'rejected')) return;

            if (availableSources.includes(SocialPlatform.Lens)) await refreshProfileFeed(SocialPlatform.Lens);
            if (availableSources.includes(SocialPlatform.Farcaster)) await refreshProfileFeed(SocialPlatform.Farcaster);
        }

        try {
            const { lensPostId, farcasterPostId, typedMessage, redPacketPayload } =
                useComposeStateStore.getState().compositePost;

            if (hasRedPacketPayload(typedMessage) && (lensPostId || farcasterPostId) && redPacketPayload?.publicKey) {
                const rpPayload = typedMessage?.meta?.get(RedPacketMetaKey) as RedPacketJSONPayload;

                const reactions = compact([
                    lensPostId
                        ? {
                              platform: FireflyRedPacketAPI.PlatformType.lens,
                              postId: lensPostId,
                          }
                        : undefined,
                    farcasterPostId
                        ? {
                              platform: FireflyRedPacketAPI.PlatformType.farcaster,
                              postId: farcasterPostId,
                              handle: currentFarcasterProfile?.handle,
                          }
                        : undefined,
                ]);

                const claimPlatform = compact([
                    lensPostId && currentLensProfile
                        ? {
                              platformId: currentLensProfile.profileId,
                              platformName: FireflyRedPacketAPI.PlatformType.lens,
                          }
                        : undefined,
                    farcasterPostId && currentFarcasterProfile
                        ? {
                              platformId: currentFarcasterProfile.profileId,
                              platformName: FireflyRedPacketAPI.PlatformType.farcaster,
                          }
                        : undefined,
                ]);
                await FireflyRedPacket.updateClaimStrategy(
                    rpPayload.rpid,
                    reactions,
                    claimPlatform,
                    redPacketPayload.publicKey,
                );
            }
        } finally {
            // Whether or not the update succeeds, you need to close the modal
            ComposeModalRef.close();
        }
    }, [
        availableSources,
        type,
        sendLens,
        sendFarcaster,
        currentFarcasterProfile,
        currentLensProfile,
        refreshProfileFeed,
    ]);

    const disabled = useMemo(() => {
        if (loading) return true;
        if ((!length || length > MAX_POST_SIZE) && !images.length && !video) return true;
        if (!availableSources.length) return true;
        return false;
    }, [length, images.length, video, availableSources.length, loading]);

    if (!isMedium) {
        return (
            <ClickableButton
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer disabled:opacity-50"
                disabled={disabled}
                onClick={handleSend}
            >
                {loading ? (
                    <LoadingIcon width={24} height={24} className="animate-spin text-main" />
                ) : (
                    <Send2Icon width={24} height={24} />
                )}
            </ClickableButton>
        );
    }

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            {visibleLength ? (
                <div className=" flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
                    <CountdownCircle count={visibleLength} width={24} height={24} className="flex-shrink-0" />
                    <span className={classNames(disabled ? ' text-danger' : '')}>
                        {visibleLength} / {MAX_POST_SIZE - invisibleLength}
                    </span>
                </div>
            ) : null}

            {visibleLength ? (
                <ClickableButton
                    className=" text-main disabled:opacity-50"
                    disabled={posts.length >= MAX_THREAD_SIZE}
                    onClick={() => {
                        newPost();
                        setEditorContent('');
                    }}
                >
                    {posts.length >= MAX_THREAD_SIZE ? (
                        <PlusCircleIcon width={28} height={28} />
                    ) : (
                        <Tooltip content={t`Add`} placement="top">
                            <PlusCircleIcon width={28} height={28} />
                        </Tooltip>
                    )}
                </ClickableButton>
            ) : null}

            <ClickableButton
                disabled={disabled}
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-black text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black',
                )}
                onClick={handleSend}
            >
                {loading ? (
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                ) : (
                    <>
                        <SendIcon width={18} height={18} className="text-primaryBottom" />
                        <span>
                            <Trans>Send</Trans>
                        </span>
                    </>
                )}
            </ClickableButton>
        </div>
    );
}
