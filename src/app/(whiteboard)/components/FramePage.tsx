import { memo, type ReactNode } from 'react';

import { CloseButton } from '@/components/IconButton.js';
import { MoreAction } from '@/modals/FrameViewerModal/MoreActionMenu.js';

interface FramePageProps {
    children: ReactNode;
}

interface FramePageTitleProps {
    children: ReactNode;
    onClose: () => void;
    onReload: () => void;
}

interface FramePageBodyProps {
    children: ReactNode;
}

export const FramePage = memo(function FramePage({ children }: FramePageProps) {
    return <div className="fixed inset-0 z-10 flex h-screen flex-col bg-white dark:bg-primaryBottom">{children}</div>;
});

export const FramePageTitle = memo(function FramePageTitle({ children, onClose, onReload }: FramePageTitleProps) {
    return (
        <div className="flex items-center justify-between bg-white px-4 py-2 shadow-md dark:bg-black">
            <CloseButton onClick={onClose} />
            <div className="flex-1 text-center">
                <h1 className="text-lg font-medium">{children}</h1>
            </div>
            <MoreAction onReload={onReload} />
        </div>
    );
});

export const FramePageBody = memo(function FramePageBody({ children }: FramePageBodyProps) {
    return <div className="flex flex-1 items-center justify-center overflow-auto p-4">{children}</div>;
});