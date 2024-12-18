import { ClickableButton } from '@/components/ClickableButton.js';
import { Image } from '@/components/Image.js';
import { NotImplementedError } from '@/constants/error.js';
import type { FrameV2 } from '@/types/frame.js';
import { memo } from 'react';

interface CardProps {
    frame: FrameV2;
}

export const Card = memo<CardProps>(function Card({ frame }) {
    const onClick = () => {
        throw new NotImplementedError();
    };

    return (
        <div className="flex flex-col">
            <Image width={530} height={350} src={frame.imageUrl} alt={frame.x_url} />
            <ClickableButton className="" onClick={onClick}>
                {frame.button.action.name}
            </ClickableButton>
        </div>
    );
});
