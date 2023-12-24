'use client';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { t } from '@lingui/macro';
import { encrypt } from '@masknet/encryption';
import { ProfileIdentifier, type SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import type { TypedMessageTextV1 } from '@masknet/typed-message';
import { forwardRef, Fragment, useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { None } from 'ts-results-es';

import LoadingIcon from '@/assets/loading.svg';
import ComposeAction from '@/components/Compose/ComposeAction.js';
import ComposeContent from '@/components/Compose/ComposeContent.js';
import ComposeSend from '@/components/Compose/ComposeSend/index.js';
import Discard from '@/components/Compose/Discard.js';
import withLexicalContext from '@/components/shared/lexical/withLexicalContext.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SITE_HOSTNAME } from '@/constants/index.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { hasRedPacketPayload } from '@/modals/hasRedPacketPayload.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { steganographyEncodeImage } from '@/services/steganography.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

async function throws(): Promise<never> {
    throw new Error('Unreachable');
}

export interface ComposeModalProps {
    type?: 'compose' | 'quote' | 'reply';
    chars?: string;
    source?: SocialPlatform;
    post?: Post;
    typedMessage?: TypedMessageTextV1 | null;
}

// { type = 'compose', post, opened, setOpened }: ComposeModalProps
export const ComposeModal = forwardRef<SingletonModalRefCreator<ComposeModalProps>>(function Compose(_, ref) {
    const [discardOpened, setDiscardOpened] = useState(false);

    const currentSource = useGlobalState.use.currentSource();
    const profile = useCurrentProfile(currentSource);
    const {
        loading,
        type,
        chars,
        typedMessage,
        addImage,
        updateType,
        updateSource,
        updatePost,
        updateChars,
        updateTypedMessage,
        clear,
    } = useComposeStateStore();

    const enqueueSnackbar = useCustomSnackbar();

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => {
            updateType(props.type || 'compose');
            updateSource(props.source || null);
            if (props.typedMessage) updateTypedMessage(props.typedMessage);
            if (props.post) updatePost(props.post);
            if (props.chars) updateChars(props.chars);
        },
        onClose: () => {
            clear();
        },
    });

    const checkClose = useCallback(() => {
        if (chars) {
            setDiscardOpened(true);
        } else {
            dispatch?.close();
        }
    }, [chars, dispatch]);

    const { loading: encryptRedPacketLoading } = useAsync(async () => {
        if (!typedMessage) return;
        if (!hasRedPacketPayload(typedMessage)) return;

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

            const secretImage = await steganographyEncodeImage(encrypted.output);
            const secretImageFile = new File([secretImage], 'image.png', { type: 'image/png' });

            addImage({
                file: secretImageFile,
            });
        } catch (error) {
            enqueueSnackbar(t`Failed to create image payload.`, {
                variant: 'error',
            });
        }
        // each time the typedMessage changes, we need to check if it has a red packet payload
    }, [typedMessage]);

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

                                    <WithLexicalContextWrapper />

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

const WithLexicalContextWrapper = withLexicalContext(() => (
    <>
        <ComposeContent />
        <ComposeAction />
    </>
));
