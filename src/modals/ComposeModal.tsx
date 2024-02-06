'use client';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { HashtagNode } from '@lexical/hashtag';
import { $createLinkNode, AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { t } from '@lingui/macro';
import { encrypt, SteganographyPreset } from '@masknet/encryption';
import { RedPacketMetaKey } from '@masknet/plugin-redpacket';
import { ProfileIdentifier, type SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { forwardRef, Fragment, useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { None } from 'ts-results-es';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import ComposeAction from '@/components/Compose/ComposeAction.js';
import ComposeContent from '@/components/Compose/ComposeContent.js';
import ComposeSend from '@/components/Compose/ComposeSend/index.js';
import Discard from '@/components/Compose/Discard.js';
import { useSetEditorContent } from '@/components/Compose/useSetEditorContent.js';
import { MentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { SocialPlatform } from '@/constants/enum.js';
import { RP_HASH_TAG, SITE_HOSTNAME, SITE_URL } from '@/constants/index.js';
import { fetchImageAsPNG } from '@/helpers/fetchImageAsPNG.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { type Chars, readChars } from '@/helpers/readChars.js';
import { throws } from '@/helpers/throws.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import type { FireflyRedPacketAPI } from '@/maskbook/packages/web3-providers/src/entry-types.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { steganographyEncodeImage } from '@/services/steganography.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

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
    type?: 'compose' | 'quote' | 'reply';
    chars?: Chars;
    source?: SocialPlatform;
    post?: Post;
    typedMessage?: TypedMessageTextV1 | null;
    redpacketProps?: {
        payloadImage: string;
        claimRequirements: FireflyRedPacketAPI.StrategyPayload[];
    };
}

// { type = 'compose', post, opened, setOpened }: ComposeModalProps
export const ComposeModalComponent = forwardRef<SingletonModalRefCreator<ComposeModalProps>>(function Compose(_, ref) {
    const [discardOpened, setDiscardOpened] = useState(false);

    const currentSource = useGlobalState.use.currentSource();

    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const profile = useCurrentProfile(currentSource);
    const {
        loading,
        type,
        chars,
        typedMessage,
        addImage,
        updateType,
        updateCurrentSource,
        updatePost,
        updateChars,
        updateTypedMessage,
        updateRedpacketProps,
        clear,
        redpacketProps,
    } = useComposeStateStore();

    const [editor] = useLexicalComposerContext();
    const enqueueSnackbar = useCustomSnackbar();

    const setEditorContent = useSetEditorContent();
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => {
            updateType(props.type || 'compose');
            updateCurrentSource(props.source || null);
            if (props.typedMessage) updateTypedMessage(props.typedMessage);
            if (props.post) updatePost(props.post);
            if (props.chars && typeof props.chars === 'string') {
                updateChars(props.chars);
                setEditorContent(props.chars);
            }
            if (props.redpacketProps) updateRedpacketProps(props.redpacketProps);
        },
        onClose: () => {
            clear();
        },
    });

    const checkClose = useCallback(() => {
        if (readChars(chars, true).length) {
            setDiscardOpened(true);
        } else {
            dispatch?.close();
        }
    }, [chars, dispatch]);

    const { loading: encryptRedPacketLoading } = useAsync(async () => {
        if (!typedMessage) return;
        if (!typedMessage.meta?.has(RedPacketMetaKey)) return;

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
            if (!redpacketProps?.payloadImage) return;

            const secretImage = await steganographyEncodeImage(
                await fetchImageAsPNG(
                    redpacketProps.payloadImage.replace('https://firefly-staging.mask.social', SITE_URL),
                ),
                encrypted.output,
                SteganographyPreset.Preset2023_Firefly,
            );

            editor.update(() => {
                const root = $getRoot();
                root.clear();
                const hashTagParagraph = $createParagraphNode();
                const paragraph = $createParagraphNode();

                const lensProfileLink = currentLensProfile ? getProfileUrl(currentLensProfile) : null;
                const farcasterProfileLink = currentFarcasterProfile ? getProfileUrl(currentFarcasterProfile) : null;

                hashTagParagraph.append($createTextNode(RP_HASH_TAG));

                paragraph.append($createTextNode(t`Check out my LuckyDrop 🧧💰✨ on Firefly mobile app or `));
                paragraph.append($createLinkNode(SITE_URL).append($createTextNode(` ${SITE_HOSTNAME}`)));
                paragraph.append($createTextNode('!'));

                root.append(hashTagParagraph);
                root.append(paragraph);

                if (lensProfileLink) {
                    const lensParagraph = $createParagraphNode();
                    lensParagraph.append($createTextNode(t`Claim on Lens: `));
                    lensParagraph.append(
                        $createLinkNode(lensProfileLink).append(
                            $createTextNode(` ${urlcat(SITE_URL, lensProfileLink)}`),
                        ),
                    );
                    root.append(lensParagraph);
                }

                if (farcasterProfileLink) {
                    const farcasterParagraph = $createParagraphNode();
                    farcasterParagraph.append($createTextNode(t`Claim on Farcaster: `));
                    farcasterParagraph.append(
                        $createLinkNode(farcasterProfileLink).append(
                            $createTextNode(` ${urlcat(SITE_URL, farcasterProfileLink)}`),
                        ),
                    );
                    root.append(farcasterParagraph);
                }

                root.selectEnd();
            });

            addImage({
                file: new File([secretImage], 'image.png', { type: 'image/png' }),
            });
        } catch (error) {
            enqueueSnackbar(t`Failed to create image payload.`, {
                variant: 'error',
            });
        }
        // each time the typedMessage changes, we need to check if it has a red packet payload
    }, [typedMessage, redpacketProps, currentLensProfile, currentFarcasterProfile]);

    return (
        <>
            <Discard opened={discardOpened} setOpened={setDiscardOpened} />

            <Transition appear show={open} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={checkClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-main/25 bg-opacity-30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className=" flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="relative w-[600px] rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950">
                                    {/* Loading */}
                                    {loading || encryptRedPacketLoading ? (
                                        <div className=" absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center">
                                            <LoadingIcon className="animate-spin" width={24} height={24} />
                                        </div>
                                    ) : null}

                                    {/* Title */}
                                    <Dialog.Title as="h3" className=" relative h-14">
                                        <XMarkIcon
                                            className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 cursor-pointer text-main"
                                            aria-hidden="true"
                                            onClick={checkClose}
                                        />

                                        <span className=" flex h-full w-full items-center justify-center text-lg font-bold capitalize text-main">
                                            {type}
                                        </span>
                                    </Dialog.Title>

                                    <ComposeContent />
                                    <ComposeAction />

                                    {/* Send */}
                                    <ComposeSend />
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
});

export const ComposeModal = forwardRef<SingletonModalRefCreator<ComposeModalProps>>(function ComposeModal(props, ref) {
    return (
        <LexicalComposer initialConfig={initialConfig}>
            <ComposeModalComponent {...props} ref={ref} />
        </LexicalComposer>
    );
});
