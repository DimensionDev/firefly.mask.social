'use client';

import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { t, Trans } from '@lingui/macro';
import { encrypt, SteganographyPreset } from '@masknet/encryption';
import { ProfileIdentifier, type SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import type { TypedMessageTextV1 } from '@masknet/typed-message';
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { $getRoot } from 'lexical';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { useAsync, useUpdateEffect } from 'react-use';
import { None } from 'ts-results-es';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import { CloseButton } from '@/components/CloseButton.js';
import { ComposeAction } from '@/components/Compose/ComposeAction.js';
import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { ComposeSend } from '@/components/Compose/ComposeSend.js';
import { ComposeThreadContent } from '@/components/Compose/ComposeThreadContent.js';
import { MentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { Modal } from '@/components/Modal.js';
import { Tooltip } from '@/components/Tooltip.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { RP_HASH_TAG, SITE_HOSTNAME, SITE_URL, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { type Chars, readChars } from '@/helpers/chars.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { fetchImageAsPNG } from '@/helpers/fetchImageAsPNG.js';
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
import type { Post } from '@/providers/types/SocialMedia.js';
import { steganographyEncodeImage } from '@/services/steganography.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
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
}
export type ComposeModalCloseProps = {
    disableClear?: boolean;
} | void;

export const ComposeModalUI = forwardRef<SingletonModalRefCreator<ComposeModalProps, ComposeModalCloseProps>>(
    function Compose(_, ref) {
        const currentSource = useGlobalState.use.currentSource();
        const currentSocialSource = narrowToSocialSource(currentSource);

        const contentRef = useRef<HTMLDivElement>(null);
        const isMedium = useIsMedium();

        const currentProfileAll = useCurrentProfileAll();
        const profile = useCurrentProfile(currentSocialSource);

        const [warningsOpen, setWarningsOpen] = useState(true);

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
            clear,
        } = useComposeStateStore();

        const compositePost = useCompositePost();
        const { typedMessage, rpPayload, id } = compositePost;

        const [editor] = useLexicalComposerContext();

        const setEditorContent = useSetEditorContent();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: ({ type, source, typedMessage, post, chars, rpPayload }) => {
                updateType(type || 'compose');
                updateAvailableSources(source ? [source] : getCurrentAvailableSources());
                if (typedMessage) updateTypedMessage(typedMessage);
                if (post) updateParentPost(post.source, post);
                if (chars) {
                    updateChars(chars);
                    setEditorContent(readChars(chars, true));
                }
                if (rpPayload) updateRpPayload(rpPayload);
            },
            onClose: (props) => {
                if (props?.disableClear) return;
                clear();
                editor.update(() => $getRoot().clear());
            },
        });

        const onClose = useCallback(async () => {
            if (posts.some((x) => !isEmptyPost(x))) {
                const confirmed = await ConfirmModalRef.openAndWaitForClose({
                    title: t`Discard`,
                    content: (
                        <div className=" text-main">
                            <Trans>This can’t be undone and you’ll lose your draft.</Trans>
                        </div>
                    ),
                });

                if (confirmed) ComposeModalRef.close();
            } else {
                dispatch?.close();
            }
        }, [posts, dispatch]);

        // Avoid recreating post content for Redpacket
        const { loading: encryptRedPacketLoading } = useAsync(async () => {
            if (!typedMessage) return;
            if (!hasRpPayload(typedMessage) || isRpEncrypted(typedMessage)) return;
            if (!rpPayload?.payloadImage) return;

            try {
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
            <Modal open={open} onClose={onClose} className="flex-col">
                <div className="relative flex w-[100vw] flex-grow flex-col overflow-auto bg-bgModal shadow-popover transition-all dark:text-gray-950 md:h-auto md:w-[600px] md:rounded-xl lg:flex-grow-0">
                    {/* Loading */}
                    {encryptRedPacketLoading ? (
                        <div className=" absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center">
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        </div>
                    ) : null}

                    {/* Title */}
                    <Dialog.Title as="h3" className=" relative h-14 shrink-0 pt-safe">
                        <CloseButton className="absolute left-4 top-1/2 -translate-y-1/2" onClick={onClose} />

                        <span className=" flex h-full w-full items-center justify-center text-lg font-bold capitalize text-main">
                            {type === 'compose' ? (
                                <Trans>Compose</Trans>
                            ) : type === 'quote' ? (
                                <Trans>Quote</Trans>
                            ) : type === 'reply' ? (
                                <Trans>Reply</Trans>
                            ) : null}
                        </span>

                        {isMedium ? null : <ComposeSend />}
                    </Dialog.Title>

                    <div className=" flex flex-col overflow-auto px-4 pb-4">
                        <div
                            ref={contentRef}
                            className="flex max-h-[300px] min-h-[300px] flex-1 flex-col overflow-auto rounded-lg border border-secondaryLine bg-bg px-4 py-[14px] md:max-h-[500px] md:min-h-[338px]"
                        >
                            {posts.length === 1 ? <ComposeContent post={compositePost} /> : <ComposeThreadContent />}
                        </div>
                    </div>

                    <ComposeAction />

                    {warningsOpen ? (
                        <div className=" flex w-full items-center justify-center gap-2 bg-orange-400 p-2">
                            <ExclamationTriangleIcon className="hidden text-white md:block" width={24} height={24} />
                            <p className=" text-left text-xs text-white md:text-center">
                                <Trans>
                                    We&apos;re updating our connection with X. Posting on X will be limited for now.
                                </Trans>
                            </p>
                            <Tooltip content={t`Close`} placement="top">
                                <XCircleIcon
                                    className="cursor-pointer text-white"
                                    width={24}
                                    height={24}
                                    onClick={() => setWarningsOpen(false)}
                                />
                            </Tooltip>
                        </div>
                    ) : null}

                    {isMedium ? <ComposeSend /> : null}
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
