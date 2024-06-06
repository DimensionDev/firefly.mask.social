'use client';

import { Dialog } from '@headlessui/react';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { t, Trans } from '@lingui/macro';
import { encrypt, SteganographyPreset } from '@masknet/encryption';
import { safeUnreachable } from '@masknet/kit';
import { EMPTY_LIST, ProfileIdentifier, type SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import type { TypedMessageTextV1 } from '@masknet/typed-message';
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    Outlet,
    rootRouteId,
    RouterProvider,
    useMatch,
    useRouter,
} from '@tanstack/react-router';
import { $getRoot } from 'lexical';
import { compact, flatten, values } from 'lodash-es';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { useAsync, useUpdateEffect } from 'react-use';
import { None } from 'ts-results-es';
import urlcat from 'urlcat';
import { v4 as uuid } from 'uuid';

import DraftIcon from '@/assets/draft.svg';
import LeftArrowIcon from '@/assets/left-arrow.svg';
import LoadingIcon from '@/assets/loading.svg';
import { CloseButton } from '@/components/CloseButton.js';
import { ComposeSend } from '@/components/Compose/ComposeSend.js';
import { ComposeUI } from '@/components/Compose/ComposeUI.js';
import { DraftList } from '@/components/Compose/DraftList.js';
import { MentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { Modal } from '@/components/Modal.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { RP_HASH_TAG, SITE_HOSTNAME, SITE_URL, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { type Chars, readChars } from '@/helpers/chars.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { fetchImageAsPNG } from '@/helpers/fetchImageAsPNG.js';
import { getCompositePost } from '@/helpers/getCompositePost.js';
import { getCurrentAvailableSources } from '@/helpers/getCurrentAvailableSources.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isEmptyPost } from '@/helpers/isEmptyPost.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { hasRpPayload, isRpEncrypted, updateRpEncrypted } from '@/helpers/rpPayload.js';
import { throws } from '@/helpers/throws.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { ComposeModalRef, ConfirmModalRef } from '@/modals/controls.js';
import type { Channel, Post } from '@/providers/types/SocialMedia.js';
import { steganographyEncodeImage } from '@/services/steganography.js';
import { useComposeDraftStateStore } from '@/store/useComposeDraftStore.js';
import { createInitPostState, useComposeStateStore } from '@/store/useComposeStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import type { ComposeType } from '@/types/compose.js';

const initialConfig = {
    namespace: 'composer',
    theme: {
        link: 'text-link',
        hashtag: 'text-link',
        mention: 'text-link',
    },
    nodes: [MentionNode, HashtagNode, AutoLinkNode, LinkNode],
    editorState: null,
    onError: () => {},
};

export interface ComposeModalProps {
    type?: ComposeType;
    chars?: Chars;
    source?: SocialSource;
    post?: Post | null;
    typedMessage?: TypedMessageTextV1 | null;
    rpPayload?: {
        payloadImage: string;
        claimRequirements: FireflyRedPacketAPI.StrategyPayload[];
    };
    channel?: Channel | null;
}
export type ComposeModalCloseProps = {
    disableClear?: boolean;
} | void;

const rootRoute = createRootRoute({
    component: ComposeRouteRoot,
});

const composeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: ComposeUI,
});

const draftRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'draft',
    component: DraftList,
});

const routeTree = rootRoute.addChildren([composeRoute, draftRoute]);

const memoryHistory = createMemoryHistory({
    initialEntries: ['/'],
});

const router = createRouter({
    routeTree,
    history: memoryHistory,
});

function ComposeRouteRoot() {
    const { type } = useComposeStateStore();
    const isMedium = useIsMedium();
    const { history } = useRouter();
    const { context } = useMatch({ from: rootRouteId });

    const isDraft = router.history.location.href === '/draft';

    const title = useMemo(() => {
        if (isDraft) return t`Draft`;
        switch (type) {
            case 'compose':
                return t`Compose`;
            case 'quote':
                return t`Quote`;
            case 'reply':
                return t`Reply`;
            default:
                safeUnreachable(type);
                return t`Compose`;
        }
    }, [isDraft, type]);

    return (
        <>
            <Dialog.Title as="h3" className="relative h-14 shrink-0 pt-safe">
                {isDraft ? (
                    <LeftArrowIcon
                        onClick={() => history.replace('/')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer text-fourMain"
                    />
                ) : (
                    <CloseButton
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-fourMain"
                        onClick={context.onClose}
                    />
                )}

                <span className="flex h-full w-full items-center justify-center gap-x-1 text-lg font-bold capitalize text-fourMain">
                    {title}
                    {!isMedium && !isDraft ? (
                        <DraftIcon
                            width={18}
                            height={18}
                            className="cursor-pointer text-fourMain"
                            onClick={() => history.push('/draft')}
                        />
                    ) : null}
                </span>
                {isMedium ? (
                    <DraftIcon
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-fourMain"
                        onClick={() => history.push('/draft')}
                    />
                ) : null}
                {isMedium || isDraft ? null : <ComposeSend />}
            </Dialog.Title>
            <Outlet />
        </>
    );
}

export const ComposeModalUI = forwardRef<SingletonModalRefCreator<ComposeModalProps, ComposeModalCloseProps>>(
    function Compose(_, ref) {
        const currentSource = useGlobalState.use.currentSource();
        const currentSocialSource = narrowToSocialSource(currentSource);

        const contentRef = useRef<HTMLDivElement>(null);

        const currentProfileAll = useCurrentProfileAll();
        const profile = useCurrentProfile(currentSocialSource);

        const {
            type,
            posts,
            addImage,
            updateType,
            updateAvailableSources,
            updateParentPost,
            updateChars,
            updateTypedMessage,
            updateRpPayload,
            updateChannel,
            clear,
        } = useComposeStateStore();
        const compositePost = useCompositePost();
        const { typedMessage, rpPayload, id } = compositePost;

        const [editor] = useLexicalComposerContext();

        const setEditorContent = useSetEditorContent();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: ({ type, source, typedMessage, post, chars, rpPayload, channel }) => {
                updateType(type || 'compose');
                updateAvailableSources(source ? [source] : getCurrentAvailableSources());
                if (typedMessage) updateTypedMessage(typedMessage);
                if (post) updateParentPost(post.source, post);
                if (chars) {
                    updateChars(chars);
                    setEditorContent(readChars(chars, true));
                }
                if (rpPayload) updateRpPayload(rpPayload);
                if (channel) updateChannel(channel);
            },
            onClose: (props) => {
                if (props?.disableClear) return;
                clear();
                router.navigate({ to: '/' });
                editor.update(() => $getRoot().clear());
            },
        });

        const onClose = useCallback(async () => {
            const { addDraft } = useComposeDraftStateStore.getState();
            const { posts, cursor, draftId, type } = useComposeStateStore.getState();
            const compositePost = getCompositePost(cursor);
            const { availableSources = EMPTY_LIST } = compositePost ?? {};
            if (posts.some((x) => !isEmptyPost(x))) {
                const errorsSource = [
                    ...new Set(
                        flatten(
                            posts.map((x) => {
                                // Failed source obtained
                                return compact(
                                    Object.entries(x.postError).map(([key, value]) => (value ? key : undefined)),
                                );
                            }),
                        ),
                    ),
                ] as SocialSource[];
                const hasError = !!errorsSource.length;

                const sources = hasError ? errorsSource : availableSources;
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: hasError ? t`Save failed post?` : t`Save Post?`,
                    content: (
                        <div className="text-main">
                            {hasError ? (
                                <Trans>
                                    You can save the failed parts of posts and send them later from your Drafts.
                                </Trans>
                            ) : (
                                <Trans>You can save this to send later from your drafts.</Trans>
                            )}
                        </div>
                    ),
                    enableCloseButton: false,
                    enableCancelButton: true,
                    cancelButtonText: t`Discard`,
                    confirmButtonText: t`Save`,
                    variant: 'normal',
                });

                if (confirmed) {
                    addDraft({
                        draftId: draftId || uuid(),
                        createdAt: new Date(),
                        cursor,
                        posts: hasError
                            ? posts.map((x) => ({ ...x, availableSources: sources, postId: createInitPostState() }))
                            : posts,
                        type,
                        availableProfiles: compact(values(currentProfileAll)).filter((x) => sources.includes(x.source)),
                    });
                    enqueueSuccessMessage(t`Your draft was saved`);
                    ComposeModalRef.close();
                } else {
                    dispatch?.close();
                }
            } else {
                dispatch?.close();
            }
        }, [dispatch, currentProfileAll]);

        // Avoid recreating post content for Redpacket
        const { loading: encryptRedPacketLoading } = useAsync(async () => {
            if (!typedMessage) return;
            if (!hasRpPayload(typedMessage) || isRpEncrypted(typedMessage)) return;
            if (!rpPayload?.payloadImage) return;

            try {
                const throws = () => {
                    throw new Error('Unreachable');
                };
                const encrypted = await encrypt(
                    {
                        author: ProfileIdentifier.of(SITE_HOSTNAME, profile?.handle),
                        authorPublicKey: None,
                        message: typedMessage,
                        network: SITE_HOSTNAME,
                        target: { type: 'public' },
                        version: -37,
                    },
                    { deriveAESKey: throws, encryptByLocalKey: throws },
                );
                if (typeof encrypted.output === 'string') throw new Error('Expected binary data.');

                const secretImage = await steganographyEncodeImage(
                    await fetchImageAsPNG(rpPayload.payloadImage),
                    encrypted.output,
                    SteganographyPreset.Preset2023_Firefly,
                );

                const fullMessage = [
                    t`Check out my LuckyDrop 🧧💰✨ on Firefly mobile app or ${SITE_URL} !`,
                    ...SORTED_SOCIAL_SOURCES.map((x) => {
                        if (x === Source.Twitter) return '';
                        const currentProfile = currentProfileAll[x];
                        const profileLink = currentProfile ? getProfileUrl(currentProfile) : null;
                        return profileLink ? t`Claim on ${resolveSourceName(x)}: ${urlcat(SITE_URL, profileLink)}` : '';
                    }),
                ].join('\n');

                const chars: Chars = [
                    {
                        tag: 'ff_rp',
                        content: RP_HASH_TAG,
                        visible: true,
                    },
                    fullMessage,
                ];

                updateChars(chars);

                setEditorContent(readChars(chars, true));

                addImage({
                    file: new File([secretImage], 'image.png', { type: 'image/png' }),
                });

                updateTypedMessage(updateRpEncrypted(typedMessage));
            } catch (error) {
                enqueueErrorMessage(t`Failed to create image payload.`, {
                    error,
                });
                throw error;
            }
            // each time the typedMessage changes, we need to check if it has a red packet payload
        }, [typedMessage, rpPayload, id, currentProfileAll]);

        useUpdateEffect(() => {
            if (!contentRef.current || !posts.length) return;
            contentRef.current.scrollTop = contentRef.current?.scrollHeight;
        }, [posts.length]);

        return (
            <Modal open={open} onClose={onClose} className="flex-col" disableScrollLock={false} disableDialogClose>
                <div className="relative flex w-[100vw] flex-grow flex-col overflow-auto bg-bgModal shadow-popover transition-all dark:text-gray-950 md:h-auto md:w-[600px] md:rounded-xl lg:flex-grow-0">
                    {/* Loading */}
                    {encryptRedPacketLoading ? (
                        <div className="absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center">
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        </div>
                    ) : null}

                    <RouterProvider router={router} context={{ onClose }} />
                </div>
            </Modal>
        );
    },
);

export const ComposeModal = forwardRef<SingletonModalRefCreator<ComposeModalProps, ComposeModalCloseProps>>(
    function ComposeModal(props, ref) {
        return (
            <LexicalComposer initialConfig={initialConfig}>
                <ComposeModalUI {...props} ref={ref} />
            </LexicalComposer>
        );
    },
);
