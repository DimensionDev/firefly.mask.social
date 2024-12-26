import { exposeToIframe, type FrameHost } from '@farcaster/frame-host';
import { delay } from '@masknet/kit';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';

import FireflyLogo from '@/assets/firefly.logo.svg';
import { CloseButton } from '@/components/IconButton.js';
import { Modal } from '@/components/Modal.js';
import { IS_DEVELOPMENT } from '@/constants/index.js';
import { createEIP1193Provider } from '@/helpers/createEIP1193Provider.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { MoreAction } from '@/modals/FrameViewerModal/MoreActionMenu.js';
import type { FrameV2, FrameV2Host } from '@/types/frame.js';

export type FrameViewerModalOpenProps = {
    ready: boolean;
    frame: FrameV2;
    frameHost: FrameV2Host;
};
export type FrameViewerModalCloseProps = void;

export const FrameViewerModal = forwardRef<SingletonModalRefCreator<FrameViewerModalOpenProps>>(
    function FrameViewerModal(_, ref) {
        const frameRef = useRef<HTMLIFrameElement | null>(null);
        const [props, setProps] = useState<FrameViewerModalOpenProps | null>(null);

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(p) {
                setProps(p);
            },
            onClose() {
                setProps(null);
            },
        });

        useEffect(() => {
            if (!frameRef.current) return;

            // frame host is required
            if (!props?.frameHost) return;

            const result = exposeToIframe({
                debug: IS_DEVELOPMENT,
                iframe: frameRef.current,
                sdk: props.frameHost,
                ethProvider: createEIP1193Provider(),
                frameOrigin: '*',
            });

            return () => {
                result?.cleanup();
            };
        }, [props]);

        const [{ loading }, onReload] = useAsyncFn(async () => {
            if (!props) return;

            const modalProps = props;

            setProps(null);
            await delay(1000);
            setProps({
                ...modalProps,
                ready: false,
            });
        }, [props]);

        if (!open || !props) return null;

        const { frame } = props;
        const u = parseUrl(frame.button.action.url);

        return (
            <Modal disableDialogClose open={open} onClose={() => dispatch?.close()}>
                <div className="relative h-[695px] w-[424px] overflow-hidden rounded-xl">
                    <div className="flex h-[60px] items-center justify-between bg-fireflyBrand px-4 py-3">
                        <div className="cursor-pointer">
                            <CloseButton onClick={() => dispatch?.close()} />
                        </div>
                        <div className="mx-4 max-w-[280px] flex-1 text-center">
                            <div className="font-semibold">{frame.button.action.name}</div>
                            {u ? <div className="text-faint text-xs">{u.host}</div> : null}
                        </div>
                        <div>
                            <MoreAction disabled={loading} onReload={onReload} />
                        </div>
                    </div>
                    <iframe
                        className="scrollbar-hide h-full w-full opacity-100"
                        ref={frameRef}
                        src={frame.button.action.url}
                        allow="clipboard-write 'src'"
                        sandbox="allow-forms allow-scripts allow-same-origin"
                        style={{
                            backgroundColor: frame.button.action.splashBackgroundColor,
                        }}
                    />
                    {!props.ready ? (
                        <div className="absolute inset-0 top-[60px] flex items-center justify-center bg-white dark:bg-black">
                            <FireflyLogo width={80} height={80} />
                        </div>
                    ) : null}
                </div>
            </Modal>
        );
    },
);
