'use client';

import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { t, Trans } from '@lingui/macro';
import { encrypt, SteganographyPreset } from '@masknet/encryption';
import { delay } from '@masknet/kit';
import { ProfileIdentifier } from '@masknet/shared-base';
import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { RouterProvider } from '@tanstack/react-router';
import { $getRoot } from 'lexical';
import { compact, flatten, values } from 'lodash-es';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { useAsync, useUpdateEffect } from 'react-use';
import urlcat from 'urlcat';
import { v4 as uuid } from 'uuid';

import LoadingIcon from '@/assets/loading.svg';
import { router } from '@/components/Compose/ComposeRouter.js';
import { MentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { Modal } from '@/components/Modal.js';
import { FileMimeType, type SocialSource } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { EMPTY_LIST, RP_HASH_TAG, SITE_HOSTNAME, SITE_URL, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { CHAR_TAG, type Chars } from '@/helpers/chars.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { fetchImageAsPNG } from '@/helpers/fetchImageAsPNG.js';
import { getCompositePost } from '@/helpers/getCompositePost.js';
import { getCurrentAvailableSources } from '@/helpers/getCurrentAvailableSources.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isEmptyPost } from '@/helpers/isEmptyPost.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { createLocalMediaObject } from '@/helpers/resolveMediaObjectUrl.js';
import { hasRpPayload, isRpEncrypted, updateRpEncrypted } from '@/helpers/rpPayload.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useCurrentProfile, useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ComposeModalRef, ConfirmModalRef } from '@/modals/controls.js';
import { captureComposeDraftPostEvent } from '@/providers/telemetry/captureComposeEvent.js';
import type { Channel, Post } from '@/providers/types/SocialMedia.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { steganographyEncodeImage } from '@/services/steganography.js';
import { useComposeDraftStateStore } from '@/store/useComposeDraftStore.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import type { ComposeType } from '@/types/compose.js';

const initialConfig = {
    namespace: 'composer',
    theme: {
        link: 'text-highlight',
        hashtag: 'text-highlight',
        mention: 'text-highlight',
    },
    nodes: [MentionNode, HashtagNode, AutoLinkNode, LinkNode],
    editorState: null,
    onError: () => {},
};

export interface ComposeModalOpenProps {
    type?: ComposeType;
    chars?: Chars;
    source?: SocialSource | SocialSource[];
    post?: Post | null;
    typedMessage?: TypedMessageTextV1 | null;
    channel?: Channel | null;
    initialPath?: string;
}

export enum CloseAction {
    Saved = 'saved',
    Discard = 'discard',
    None = 'none',
}

export type ComposeModalCloseProps = {
    disableClear?: boolean;
} | void;

export const ComposeModalUI = forwardRef<SingletonModalRefCreator<ComposeModalOpenProps, ComposeModalCloseProps>>(
    function Compose(_, ref) {
        const currentSource = useGlobalState.use.currentSource();
        const currentSocialSource = narrowToSocialSource(currentSource);

        const contentRef = useRef<HTMLDivElement>(null);

        const currentProfileAll = useCurrentProfileAll();
        const profile = useCurrentProfile(currentSocialSource);

        const {
            posts,
            insertImage,
            updateType,
            updateAvailableSources,
            updateParentPost,
            updateChars,
            updateTypedMessage,
            updateChannel,
            clear,
        } = useComposeStateStore();
        const { clearScheduleTime } = useComposeScheduleStateStore();
        const compositePost = useCompositePost();
        const { typedMessage, rpPayload, id, availableSources } = compositePost;

        const [editor] = useLexicalComposerContext();

        const setEditorContent = useSetEditorContent();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: ({ type, source, typedMessage, post, chars, channel, initialPath }) => {
                updateType(type || 'compose');
                updateAvailableSources(
                    source ? (Array.isArray(source) ? source : [source]) : getCurrentAvailableSources(),
                );
                if (typedMessage) updateTypedMessage(typedMessage);
                if (post) updateParentPost(post.source, post);
                if (chars) {
                    updateChars(chars);
                    setEditorContent(chars);
                }
                if (channel) updateChannel(channel);
                if (initialPath) router.navigate({ to: initialPath });
            },
            onClose: async (props) => {
                if (props?.disableClear) return;

                // wait for animation to finish
                await delay(300);

                clear();
                clearScheduleTime();
                router.navigate({ to: '/' });

                // https://github.com/DimensionDev/firefly.mask.social/pull/1644
                await delay(1000);

                editor.update(() => $getRoot().clear());
            },
        });

        const isSmall = useIsSmall('max');
        const onClose = useCallback(async () => {
            const { addDraft } = useComposeDraftStateStore.getState();
            const { posts, cursor, currentDraftId, type } = useComposeStateStore.getState();
            const { scheduleTime } = useComposeScheduleStateStore.getState();
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
                        <div className="text-[15px] text-main md:text-base">
                            {hasError ? (
                                <Trans>
                                    You can save the failed parts of posts and send them later from your Drafts.
                                </Trans>
                            ) : (
                                <Trans>You can save this to send later from your drafts.</Trans>
                            )}
                        </div>
                    ),
                    enableCloseButton: !isSmall,
                    enableCancelButton: true,
                    cancelButtonText: t`Discard`,
                    confirmButtonText: t`Save`,
                    variant: 'normal',
                });
                if (confirmed === null) return CloseAction.None;

                if (confirmed) {
                    const draft = {
                        draftId: currentDraftId || uuid(),
                        createdAt: new Date(),
                        cursor,
                        posts: hasError ? posts.map((x) => ({ ...x, availableSources: sources })) : posts,
                        type,
                        availableProfiles: compact(values(currentProfileAll)).filter((x) => sources.includes(x.source)),
                        scheduleTime,
                    };

                    addDraft(draft);
                    ComposeModalRef.close();
                    enqueueSuccessMessage(t`Your draft was saved.`);
                    captureComposeDraftPostEvent(EventId.COMPOSE_DRAFT_CREATE_SUCCESS, posts[0], {
                        draftId: draft.draftId,
                        thread: posts,
                    });
                    return CloseAction.Saved;
                } else {
                    dispatch?.close();
                }
            } else {
                dispatch?.close();
            }
            return CloseAction.Discard;
        }, [isSmall, currentProfileAll, dispatch]);

        const promoteLink = useMemo(() => {
            const preferSource = SORTED_SOCIAL_SOURCES.find(
                (x) => availableSources.includes(x) && currentProfileAll[x],
            );
            if (!preferSource) return SITE_URL;
            const preferProfile = currentProfileAll[preferSource]!;
            return urlcat(location.origin, getProfileUrl(preferProfile));
        }, [currentProfileAll, availableSources]);

        // Avoid recreating post content for Redpacket
        const { loading: encryptRedPacketLoading } = useAsync(async () => {
            const { cursor } = useComposeStateStore.getState();
            const compositePost = getCompositePost(cursor);
            if (!typedMessage) return;
            if (!hasRpPayload(typedMessage) || isRpEncrypted(typedMessage)) return;
            if (!rpPayload?.payloadImage) return;

            try {
                const throws = () => {
                    throw new UnreachableError('throws', 'This function should not be called.');
                };
                const encrypted = await encrypt(
                    {
                        author: ProfileIdentifier.of(SITE_HOSTNAME, profile?.handle),
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

                const promoteMessage = t`Check out my LuckyDrop 🧧💰✨ on Firefly mobile app or ${promoteLink} !`;

                const chars: Chars = [
                    {
                        tag: CHAR_TAG.FIREFLY_RP,
                        content: RP_HASH_TAG,
                        visible: false,
                    },
                    {
                        tag: CHAR_TAG.PROMOTE_LINK,
                        content: promoteLink,
                        visible: false,
                    },
                    ...(compositePost ? compositePost.chars : []),
                    promoteMessage,
                ];

                updateChars(chars);
                setEditorContent(chars);
                insertImage(
                    createLocalMediaObject(new File([secretImage], 'image.png', { type: FileMimeType.PNG })),
                    0,
                );
                updateTypedMessage(updateRpEncrypted(typedMessage));
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to create image payload.`), {
                    error,
                });
                throw error;
            }
            // each time the typedMessage changes, we need to check if it has a red packet payload
        }, [typedMessage, rpPayload, id, currentProfileAll, promoteLink]);

        useUpdateEffect(() => {
            if (!contentRef.current || !posts.length) return;
            contentRef.current.scrollTop = contentRef.current?.scrollHeight;
        }, [posts.length]);

        return (
            <Modal open={open} onClose={onClose} className="flex-col" disableScrollLock={false} disableDialogClose>
                <div className="relative flex h-[100vh] w-[100vw] flex-col overflow-auto bg-lightBottom shadow-popover transition-all dark:bg-darkBottom dark:text-gray-950 md:h-[620px] md:w-[600px] md:rounded-xl lg:flex-grow-0">
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

export const ComposeModal = forwardRef<SingletonModalRefCreator<ComposeModalOpenProps, ComposeModalCloseProps>>(
    function ComposeModal(props, ref) {
        return (
            <LexicalComposer initialConfig={initialConfig}>
                <ComposeModalUI {...props} ref={ref} />
            </LexicalComposer>
        );
    },
);
