import type { SetPrimaryButton } from '@farcaster/frame-host';
import { memo, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { Source } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { FrameViewerModalRef, LoginModalRef } from '@/modals/controls.js';
import { FarcasterFrameHost } from '@/providers/frame/Host.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { FrameV2 } from '@/types/frame.js';

interface CardProps {
    post: Post;
    frame: FrameV2;
}

export const Card = memo<CardProps>(function Card({ post, frame }) {
    const [primaryButton, setPrimaryButton] = useState<Parameters<SetPrimaryButton>[0] | null>(null);

    const [frameHost] = useState(
        () =>
            new FarcasterFrameHost(frame, post, {
                ready: (options) => {
                    FrameViewerModalRef.open({
                        ready: true,
                        frame,
                        frameHost,
                    });
                },
                close: () => FrameViewerModalRef.close(),
                setPrimaryButton,
            }),
    );

    const onClick = () => {
        const profile = getCurrentProfile(Source.Farcaster);
        if (!profile) {
            LoginModalRef.open({
                source: Source.Farcaster,
            });
            return;
        }

        FrameViewerModalRef.open({
            ready: false,
            frame,
            frameHost,
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