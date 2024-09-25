'use client';

import { ClickableButton } from '@/components/ClickableButton.js';
import type { NativeMethodItem } from '@/types/bridge.js';

interface Props {
    item: NativeMethodItem;
}

export function NativeMethodButton({ item }: Props) {
    return (
        <ClickableButton
            className="rounded-md bg-main px-2 py-1 text-primaryBottom"
            onClick={() => {
                console.log(item);
            }}
        >
            {item.name}()
        </ClickableButton>
    );
}
