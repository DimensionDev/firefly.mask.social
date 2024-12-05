import { DialogTitle } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { forwardRef, useCallback, useState } from 'react';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { Modal } from '@/components/Modal.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ChannelSelectPanel, type ChannelSelectPanelProps } from '@/modals/ChannelSelectModal/ChannelSelectPanel.js';
import type { Channel } from '@/providers/types/SocialMedia.js';

export interface ChannelSelectModalOpenProps {
    selected?: Channel;
    source: ChannelSelectPanelProps['source'];
}

export type ChannelSelectModalCloseProps = Channel | null;

export const ChannelSelectModal = forwardRef<
    SingletonModalRefCreator<ChannelSelectModalOpenProps, ChannelSelectModalCloseProps>
>(function ChannelSelectModal(_, ref) {
    const [props, setProps] = useState<ChannelSelectModalOpenProps>();

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => setProps(props),
        onClose: () => setProps(undefined),
    });

    const selectedId = props?.selected?.id;
    const isSelected = useCallback(
        (channel: Channel) => {
            if (!selectedId) return false;
            return channel.id === selectedId;
        },
        [selectedId],
    );

    if (!props) return null;

    return (
        <Modal open={open} onClose={() => dispatch?.close(null)} modalClassName="z-50">
            <div className="z-50 flex h-[70vh] w-4/5 flex-col rounded-md bg-lightBottom p-4 pt-0 text-medium text-lightMain shadow-popover transition-all dark:bg-darkBottom md:h-[620px] md:w-[600px] md:rounded-xl">
                <DialogTitle as="h3" className="relative h-14 shrink-0 pt-safe">
                    <LeftArrowIcon
                        onClick={() => dispatch?.close(null)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer text-main"
                    />
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold text-main">
                        <Trans>Select Club</Trans>
                    </span>
                </DialogTitle>
                <div className="min-h-0 flex-1 overflow-hidden">
                    <ChannelSelectPanel
                        source={props.source}
                        isSelected={isSelected}
                        onSelect={(channel) => dispatch?.close(channel)}
                    />
                </div>
            </div>
        </Modal>
    );
});
