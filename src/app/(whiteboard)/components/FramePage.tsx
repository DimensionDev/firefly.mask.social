import { memo, type ComponentType, type FC, type ReactNode } from 'react';
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
    return <div className="flex h-screen flex-col bg-gray-50">{children}</div>;
});

export const FramePageTitle = memo(function FramePageTitle({ children, onClose, onReload }: FramePageTitleProps) {
    return (
        <div className="flex items-center justify-between bg-white px-4 py-2 shadow-md">
            <CloseButton onClick={onClose} />
            <div className="flex-1 text-center">
                <h1 className="text-lg font-medium text-gray-900">{children}</h1>
            </div>
            <MoreAction onReload={onReload} />
        </div>
    );
});

export const FramePageBody = memo(function FramePageBody({ children }: FramePageBodyProps) {
    return <div className="flex-1 overflow-auto p-4">{children}</div>;
});
