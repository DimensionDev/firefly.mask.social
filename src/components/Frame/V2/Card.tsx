import { memo } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import type { FrameV2 } from '@/types/frame.js';
import { FrameV2ModalRef } from '@/modals/controls.js';

interface CardProps {
    frame: FrameV2;
}

export const Card = memo<CardProps>(function Card({ frame }) {
    const onClick = () => {
        FrameV2ModalRef.open({
            frame,
        });
    };

    return (
        <div className="flex flex-col overflow-hidden rounded-xl">
            <Image
                className="h-auto w-full"
                style={{ backgroundColor: frame.button.action.splashBackgroundColor }}
                width={530}
                height={350}
                src={frame.imageUrl}
                alt={frame.x_url}
            />
            <ClickableButton className="bg-fireflyBrand px-1 py-3 font-bold text-white" onClick={onClick}>
                {frame.button.action.name}
            </ClickableButton>
        </div>
    );
});
