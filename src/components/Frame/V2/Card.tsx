import type { SetPrimaryButton } from '@farcaster/frame-host';
import { memo, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { FrameViewerModalRef } from '@/modals/controls.js';
import type { FrameV2 } from '@/types/frame.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface CardProps {
    post: Post;
    frame: FrameV2;
}

export const Card = memo<CardProps>(function Card({ frame }) {
    const [primaryButton, setPrimaryButton] = useState<Parameters<SetPrimaryButton>[0] | null>(null);

    const onClick = () => {
        FrameViewerModalRef.open({
            frame,
            // TODO
            frameHost: null!,
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
            {primaryButton?.hidden ? null : (
                <ClickableButton
                    className="bg-fireflyBrand px-1 py-3 font-bold text-white"
                    disabled={primaryButton?.loading || primaryButton?.disabled}
                    onClick={onClick}
                >
                    {primaryButton?.text ?? frame.button.action.name}
                </ClickableButton>
            )}
        </div>
    );
});
