import { Popover } from '@headlessui/react';
import { BugAntIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { CrossIsolationMessages } from '@masknet/shared-base';
import { compact, values } from 'lodash-es';
import { useMemo } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import AddThread from '@/assets/addThread.svg';
import GalleryIcon from '@/assets/gallery.svg';
import RedPacketIcon from '@/assets/red-packet.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ChannelSearchPanel } from '@/components/Compose/ChannelSearchPanel.js';
import { GifEntryButton } from '@/components/Compose/GifEntryButton.js';
import { Media } from '@/components/Compose/Media.js';
import { PostBy } from '@/components/Compose/PostBy.js';
import { ReplyRestriction } from '@/components/Compose/ReplyRestriction.js';
import { ReplyRestrictionText } from '@/components/Compose/ReplyRestrictionText.js';
import { ScheduleIcon } from '@/components/Compose/ScheduleIcon.js';
import { PollButton } from '@/components/Poll/PollButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
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
import { PluginDebuggerMessages } from '@/mask/message-host/index.js';
import { ComposeModalRef, ConnectWalletModalRef } from '@/modals/controls.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeActionProps {}

export function ComposeAction(props: ComposeActionProps) {
    const isMedium = useIsMedium();
    const account = useAccount();

    const currentProfileAll = useCurrentProfileAll();
    const post = useCompositePost();
    const { type, posts, addPostInThread, updateRestriction } = useComposeStateStore();
    const { scheduleTime } = useComposeScheduleStateStore();
    const { availableSources, images, video, restriction, parentPost, channel, poll } = post;

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

    const maxImageCount = getCurrentPostImageLimits(availableSources);
    const mediaDisabled = !!video || images.length >= maxImageCount || !!poll;

    const hasError = useMemo(() => {
        return posts.some((x) => !!compact(values(x.postError)).length);
    }, [posts]);

    return (
        <div className="px-4 pb-4">
            <div className="relative flex h-9 items-center gap-3">
                <Popover as="div" className="relative">
                    {({ close }) => (
                        <>
                            <Popover.Button className="flex cursor-pointer gap-1 text-main focus:outline-none">
                                <Tooltip content={t`Media`} placement="top" disabled={mediaDisabled}>
                                    <GalleryIcon
                                        className={classNames(
                                            'text-main',
                                            mediaDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                                        )}
                                        width={24}
                                        height={24}
                                    />
                                </Tooltip>
                            </Popover.Button>

                            {!mediaDisabled ? <Media close={close} /> : null}
                        </>
                    )}
                </Popover>

                {type === 'compose' ? <PollButton /> : null}

                <ScheduleIcon className="text-main" />

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
                                    PluginDebuggerMessages?.connectionDialogUpdated.sendToLocal({ open: true });
                                }}
                            />
                        </Tooltip>
                        <Tooltip content={t`Debug Console`} placement="top">
                            <BugAntIcon
                                className={`h-6 w-6 cursor-pointer text-main`}
                                onClick={async () => {
                                    ComposeModalRef.close();
                                    await delay(300);
                                    PluginDebuggerMessages?.consoleDialogUpdated.sendToLocal({ open: true });
                                }}
                            />
                        </Tooltip>
                    </>
                ) : null}

                <div
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
                </div>

                {usedLength && !isMedium ? (
                    <div className="ml-auto flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
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
                <span className="text-[15px] text-secondary">
                    <Trans>Share to</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button
                                className="flex cursor-pointer gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={availableSources.some((x) => !!parentPost[x]) || hasError}
                            >
                                <span className="flex items-center gap-x-1 font-bold">
                                    {availableSources
                                        .filter((x) => !!currentProfileAll[x] && SORTED_SOCIAL_SOURCES.includes(x))
                                        .map((y) => (
                                            <SocialSourceIcon key={y} source={y} size={20} />
                                        ))}
                                </span>
                                {type === 'compose' && !hasError ? (
                                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                ) : null}
                            </Popover.Button>
                            <PostBy />
                        </>
                    )}
                </Popover>
            </div>

            <div className="flex h-9 items-center justify-between pb-safe">
                <span className="text-[15px] text-secondary">
                    <Trans>Allow replies from</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button
                                className="flex cursor-pointer gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={hasError}
                            >
                                <span className="text-[15px] font-bold">
                                    <ReplyRestrictionText type={restriction} />
                                </span>
                                {!hasError ? <ChevronRightIcon className="h-5 w-5" aria-hidden="true" /> : null}
                            </Popover.Button>
                            <ReplyRestriction restriction={restriction} setRestriction={updateRestriction} />
                        </>
                    )}
                </Popover>
            </div>

            <div
                className="flex h-9 items-center justify-between pb-safe"
                style={{
                    visibility:
                        availableSources.some((x) => SORTED_CHANNEL_SOURCES.includes(x)) &&
                        (type === 'compose' || type === 'quote')
                            ? 'unset'
                            : 'hidden',
                }}
            >
                <span className="text-[15px] text-secondary">
                    <Trans>Farcaster channel</Trans>
                </span>
                <Popover as="div" className="relative">
                    {({ close }) => (
                        <>
                            <Popover.Button
                                className="flex cursor-pointer gap-1 text-main focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={hasError}
                            >
                                <span className="text-[15px] font-bold">
                                    {compact(
                                        SORTED_SOCIAL_SOURCES.filter((source) => !!channel[source]).map(
                                            (source) => channel[source]?.name,
                                        ),
                                    ).join(',')}
                                </span>
                                {!hasError ? <ChevronRightIcon className="h-5 w-5" aria-hidden="true" /> : null}
                            </Popover.Button>
                            <ChannelSearchPanel onSelected={close} />
                        </>
                    )}
                </Popover>
            </div>
        </div>
    );
}
