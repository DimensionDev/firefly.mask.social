import { forwardRef, useState } from 'react';

import { CloseButton } from '@/components/IconButton.js';
import { Modal } from '@/components/Modal.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { MoreAction } from '@/modals/FrameViewerModal/MoreActionMenu.js';
import type { FrameV2 } from '@/types/frame.js';
import { NotImplementedError } from '@/constants/error.js';

export type FrameViewerModalOpenProps = {
    frame: FrameV2;
};
export type FrameViewerModalCloseProps = void;

export const FrameViewerModal = forwardRef<SingletonModalRefCreator<FrameViewerModalOpenProps>>(
    function FrameViewerModal(_, ref) {
        const [props, setProps] = useState<FrameViewerModalOpenProps | null>(null);

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(p) {
                setProps(p);
            },
            onClose() {
                setProps(null);
            },
        });

        if (!open || !props) return null;

        const { frame } = props;
        const u = parseUrl(frame.button.action.url);

        return (
            <Modal disableDialogClose open={open} onClose={() => dispatch?.close()}>
                <div className="relative h-[695px] w-[424px] overflow-hidden rounded-xl">
                    <div className=" bg-fireflyBrand flex h-[60px] items-center justify-between px-4 py-3">
                        <div className="cursor-pointer">
                            <CloseButton onClick={() => dispatch?.close()} />
                        </div>
                        <div className="mx-4 max-w-[280px] flex-1 text-center">
                            <div className="font-semibold">{frame.button.action.name}</div>
                            {u ? <div className="text-faint text-xs">{u.host}</div> : null}
                        </div>
                        <div>
                            <MoreAction
                                onReload={() => {
                                    throw new NotImplementedError();
                                }}
                            />
                        </div>
                    </div>
                    <iframe
                        className="scrollbar-hide h-full w-full opacity-100"
                        src={frame.button.action.url}
                        allow="clipboard-write 'src'"
                        sandbox="allow-forms allow-scripts allow-same-origin"
                        style={{
                            backgroundColor: frame.button.action.splashBackgroundColor,
                        }}
                    />
                </div>
            </Modal>
        );
    },
);
