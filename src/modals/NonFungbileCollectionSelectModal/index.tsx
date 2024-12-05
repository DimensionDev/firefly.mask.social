import { DialogTitle } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { type NonFungibleCollection } from '@masknet/web3-shared-base';
import { ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { forwardRef, useCallback, useState } from 'react';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { Modal } from '@/components/Modal.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { NonFungibleCollectionSelectPanel } from '@/modals/NonFungbileCollectionSelectModal/FungibleTokenSelectPanel.js';
import type { Collection } from '@/modals/NonFungbileCollectionSelectModal/types.js';

export interface NonFungibleCollectionSelectModalOpenProps {
    selected?: NonFungibleCollection<ChainId, SchemaType>;
}

export type NonFungibleCollectioinSelectModalCloseProps = NonFungibleCollection<ChainId, SchemaType> | null;

export const NonFungibleCollectionSelectModal = forwardRef<
    SingletonModalRefCreator<NonFungibleCollectionSelectModalOpenProps, NonFungibleCollectioinSelectModalCloseProps>
>(function NonFungibleCollectionSelectModal(_, ref) {
    const [props, setProps] = useState<NonFungibleCollectionSelectModalOpenProps>();

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => setProps(props),
        onClose: () => setProps(undefined),
    });

    const isSelected = useCallback(
        (collection: Collection) => {
            if (!props?.selected) return false;
            return collection.chainId === props.selected.chainId && collection.address === props.selected.address;
        },
        [props?.selected],
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
                        <Trans>Select Collection</Trans>
                    </span>
                </DialogTitle>
                <div className="min-h-0 flex-1 overflow-hidden">
                    <NonFungibleCollectionSelectPanel
                        isSelected={isSelected}
                        onSelected={(collection) => dispatch?.close(collection)}
                    />
                </div>
            </div>
        </Modal>
    );
});
