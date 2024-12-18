import { memo } from 'react';

import { CloseButton } from '@/components/CloseButton.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import type { FrameV2 } from '@/types/frame.js';
import { MoreAction } from '@/modals/FrameV2Modal/MoreActionMenu.js';

interface FrameViewerProps {
    frame: FrameV2;
    onClose?: () => void;
}

export const FrameViewer = memo<FrameViewerProps>(function FrameViewer({ frame }) {
    const u = parseUrl(frame.button.action.url);

    return (
        <div className="relative h-[695px] w-[424px]">
            <div className="bg-elevated-nohover flex h-[60px] items-center justify-between px-4 py-3">
                <div className="cursor-pointer">
                    <CloseButton />
                </div>
                <div className="mx-4 max-w-[280px] flex-1 text-center">
                    <div className="font-semibold">{frame.button.action.name}</div>
                    {u ? <div className="text-faint text-xs">{u.host}</div> : null}
                </div>
                <div className="text-muted cursor-pointer rounded-full px-1 hover:bg-gray-200">
                    <MoreAction />
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
    );
});
