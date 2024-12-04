import { DialogTitle } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { forwardRef, useState } from 'react';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { Modal } from '@/components/Modal.js';
import { SearchTipsTokenPanel } from '@/components/Search/SearchTipsTokenPanel.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import type { Token } from '@/providers/types/Transfer.js';

export interface TokenSelectorModalOpenProps {
    address: string;
    disableBackdropClose?: boolean;
    isSelected?: (item: Token) => boolean;
}

export type TokenSelectorModalCloseProps = Token | null;

export const TokenSelectorModal = forwardRef<
    SingletonModalRefCreator<TokenSelectorModalOpenProps, TokenSelectorModalCloseProps>
>(function TokenSelectorModal(_, ref) {
    const [props, setProps] = useState<TokenSelectorModalOpenProps>();

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => setProps(props),
        onClose: () => setProps(undefined),
    });

    if (!props) return null;

    return (
        <Modal
            open={open}
            disableBackdropClose={props.disableBackdropClose}
            onClose={() => dispatch?.close(null)}
            modalClassName="z-50"
        >
            <div className="z-50 h-[70vh] w-4/5 rounded-md bg-lightBottom p-4 pt-0 text-medium text-lightMain shadow-popover transition-all dark:bg-darkBottom md:h-[620px] md:w-[600px] md:rounded-xl">
                <DialogTitle as="h3" className="relative h-14 shrink-0 pt-safe">
                    <LeftArrowIcon
                        onClick={() => dispatch?.close(null)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer text-main"
                    />
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold text-main">
                        <Trans>Select Token </Trans>
                    </span>
                </DialogTitle>
                <div className="h-[calc(100%_-_56px)]">
                    <SearchTipsTokenPanel
                        address={props.address}
                        isSelected={props.isSelected}
                        onSelected={(token) => dispatch?.close(token)}
                    />
                </div>
            </div>
        </Modal>
    );
});
