import { Dialog, Transition } from '@headlessui/react';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, Fragment, useState } from 'react';

export interface DraggablePopoverProps {
    backdrop?: boolean;
    content?: React.ReactNode;
}

export const DraggablePopover = forwardRef<SingletonModalRefCreator<DraggablePopoverProps>>(
    function DraggablePopover(_, ref) {
        const [enableBackdrop, setEnableBackdrop] = useState(true);
        const [content, setContent] = useState<React.ReactNode>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setEnableBackdrop(props.backdrop ?? true);
                setContent(props.content);
            },
        });

        return (
            <Transition appear show={open} as={Fragment}>
                <Dialog as="div" onClose={() => dispatch?.close()}>
                    {enableBackdrop ? (
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 z-40 bg-main/25 bg-opacity-30" />
                        </Transition.Child>
                    ) : null}
                    <Transition.Child
                        as={Fragment}
                        enter="transition-transform ease-out duration-300"
                        enterFrom="translate-y-full"
                        enterTo="translate-y-0"
                        leave="transition-transform ease-in duration-200"
                        leaveFrom="translate-y-0"
                        leaveTo="translate-y-full"
                    >
                        <Dialog.Panel className=" fixed inset-x-6 bottom-3 top-auto z-40 mx-auto flex max-w-[800px] flex-col justify-center rounded-2xl border border-line bg-primaryBottom p-6 shadow-[0px_4px_30px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_8px_20px_0px_rgba(255,255,255,0.04)]">
                            <div className=" absolute inset-x-0 top-0.5 z-10 m-auto flex w-20 cursor-pointer justify-center p-2">
                                <div className=" h-1 w-12 rounded-full bg-main" />
                            </div>
                            <div className=" max-h-[50vh] w-full overflow-y-auto">{content}</div>
                        </Dialog.Panel>
                    </Transition.Child>
                </Dialog>
            </Transition>
        );
    },
);
