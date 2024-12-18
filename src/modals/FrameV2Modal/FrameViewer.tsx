import MoreIcon from '@/assets/more.svg';
import { CloseButton } from '@/components/CloseButton.js';
import type { FrameV2 } from '@/types/frame.js';
import { memo } from 'react';

interface FrameViewerProps {
    frame: FrameV2;
    onClose?: () => void;
}

export const FrameViewer = memo<FrameViewerProps>(function FrameViewer({ frame }) {
    return (
        <div className="relative h-[695px] w-[424px]">
            <div className="bg-elevated-nohover flex h-[60px] items-center justify-between px-4 py-3">
                <div className="cursor-pointer">
                    <CloseButton />
                </div>
                <div className="mx-4 max-w-[280px] flex-1 text-center">
                    <div className="font-semibold">Warpcast Rewards</div>
                    <div className="text-faint text-xs">built by warpcast</div>
                </div>
                <button type="button" id="radix-:r3m:" aria-haspopup="menu" aria-expanded="false" data-state="closed">
                    <div className="text-muted cursor-pointer rounded-full px-1 hover:bg-gray-200">
                        <MoreIcon width={24} height={24} className="text-secondary" />
                    </div>
                </button>
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
