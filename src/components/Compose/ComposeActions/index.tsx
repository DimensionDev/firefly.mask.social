import { BugAntIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { CrossIsolationMessages } from '@masknet/shared-base';
import { compact, values } from 'lodash-es';
import { useMemo } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import AddThread from '@/assets/add-thread.svg';
import RedPacketIcon from '@/assets/red-packet.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ChooseChannelAction } from '@/components/Compose/ComposeActions/ChannelAction.js';
import { MediaAction } from '@/components/Compose/ComposeActions/MediaAction.js';
import { PlatformAction } from '@/components/Compose/ComposeActions/PlatformAction.js';
import { ReplyRestrictionAction } from '@/components/Compose/ComposeActions/ReplyRestrictionAction.js';
import { SchedulePostEntryButton } from '@/components/Compose/SchedulePostEntryButton.js';
import { GifEntryButton } from '@/components/Gif/GifEntryButton.js';
import { PollButton } from '@/components/Poll/PollButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { NODE_ENV, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { MAX_POST_SIZE_PER_THREAD, SORTED_CHANNEL_SOURCES, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { measureChars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { ComposeModalRef, ConnectWalletModalRef } from '@/modals/controls.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeActionsProps {}

export function ComposeActions(props: ComposeActionsProps) {
    const isMedium = useIsMedium();
    const account = useAccount();

    const currentProfileAll = useCurrentProfileAll();
    const post = useCompositePost();
    const { type, posts, addPostInThread } = useComposeStateStore();
    const { availableSources, images, video, poll, rpPayload } = post;

    const { scheduleTime } = useComposeScheduleStateStore();
    const { usedLength, availableLength } = measureChars(post);

    const setEditorContent = useSetEditorContent();

    const [{ loading }, openRedPacketComposeDialog] = useAsyncFn(async () => {
        if (!account.isConnected) return ConnectWalletModalRef.open();
        await connectMaskWithWagmi();
        // import dynamically to avoid the start up dependency issue of mask packages
        await import('@/helpers/setupCurrentVisitingProfile.js').then((module) =>
            module.setupCurrentVisitingProfileAsFireflyApp(),
        );
        await delay(300);
        CrossIsolationMessages.events.redpacketDialogEvent.sendToLocal({
            open: true,
            fireflyContext: Object.fromEntries(
                SORTED_SOCIAL_SOURCES.map((x) => {
                    const currentProfile = currentProfileAll[x];
                    return [
                        `current${x}Profile`,
                        currentProfile
                            ? {
                                  ...currentProfile,
                                  ownedBy: currentProfile.ownedBy?.address,
                              }
                            : undefined,
                    ];
                }),
            ),
        });
    }, [currentProfileAll]);

    const maxImageCount = getCurrentPostImageLimits(type, availableSources);
    const mediaDisabled = !!video || images.length >= maxImageCount || !!poll;

    const hasError = useMemo(() => {
        return posts.some((x) => !!compact(values(x.postError)).length);
    }, [posts]);

    const showChannel =
        availableSources.some((x) => SORTED_CHANNEL_SOURCES.includes(x)) && (type === 'compose' || type === 'quote');

    return (
        <div className="px-4 pb-4">
            <div className="relative flex h-9 items-center gap-3">
                <MediaAction />

                {type === 'compose' && env.external.NEXT_PUBLIC_POLL === STATUS.Enabled ? <PollButton /> : null}

                {env.external.NEXT_PUBLIC_SCHEDULE_POST === STATUS.Enabled && !rpPayload ? (
                    <Tooltip content={t`Schedule`} placement="top">
                        <SchedulePostEntryButton className="text-main" />
                    </Tooltip>
                ) : null}

                {env.external.NEXT_PUBLIC_COMPOSE_GIF === STATUS.Enabled ? (
                    <GifEntryButton disabled={mediaDisabled} />
                ) : null}

                {env.shared.NODE_ENV === NODE_ENV.Development ? (
                    <>
                        <Tooltip content={t`Debug Connection`} placement="top">
                            <BugAntIcon
                                className="h-6 w-6 cursor-pointer text-main"
                                onClick={async () => {
                                    ComposeModalRef.close();
                                    await delay(300);
                                }}
                            />
                        </Tooltip>
                        <Tooltip content={t`Debug Console`} placement="top">
                            <BugAntIcon
                                className={`h-6 w-6 cursor-pointer text-main`}
                                onClick={async () => {
                                    ComposeModalRef.close();
                                    await delay(300);
                                }}
                            />
                        </Tooltip>
                    </>
                ) : null}

                {!scheduleTime && !mediaDisabled ? (
                    <ClickableButton
                        className={classNames(
                            'hidden h-6 items-center gap-x-2 rounded-[32px] border border-foreground px-3 py-1 md:flex',
                            {
                                'opacity-50': loading || mediaDisabled,
                                'cursor-not-allowed': mediaDisabled,
                                'cursor-pointer': !mediaDisabled,
                            },
                        )}
                        onClick={async () => {
                            if (loading || mediaDisabled) return;
                            openRedPacketComposeDialog();
                        }}
                    >
                        <RedPacketIcon width={16} height={16} />
                        <span className="text-[13px] font-medium leading-6 text-lightMain">
                            <Trans>LuckyDrop</Trans>
                        </span>
                    </ClickableButton>
                ) : null}

                {usedLength && !isMedium ? (
                    <div className="ml-auto flex items-center gap-[10px] whitespace-nowrap text-medium text-main">
                        <span className={classNames(usedLength > availableLength ? 'text-danger' : '')}>
                            {usedLength} / {availableLength}
                        </span>
                    </div>
                ) : null}

                {usedLength && type === 'compose' && !isMedium ? (
                    <ClickableButton
                        className="text-main"
                        disabled={posts.length >= MAX_POST_SIZE_PER_THREAD}
                        onClick={() => {
                            addPostInThread();
                            setEditorContent('');
                        }}
                    >
                        <AddThread width={28} height={28} />
                    </ClickableButton>
                ) : null}
            </div>

            <div className="flex h-9 items-center justify-between">
                <span className="text-medium text-secondary">
                    <Trans>Share to</Trans>
                </span>
                <PlatformAction hasError={hasError} />
            </div>

            <div className="flex h-9 items-center justify-between pb-safe">
                <span className="text-medium text-secondary">
                    <Trans>Allow replies from</Trans>
                </span>
                <ReplyRestrictionAction hasError={hasError} />
            </div>

            {showChannel ? (
                <div className="flex h-9 items-center justify-between pb-safe">
                    <span className="text-medium text-secondary">
                        <Trans>Farcaster channel</Trans>
                    </span>
                    <ChooseChannelAction hasError={hasError} />
                </div>
            ) : null}
        </div>
    );
}
