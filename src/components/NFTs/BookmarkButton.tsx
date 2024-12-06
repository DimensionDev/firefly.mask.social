import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import type { NftPreview } from '@/providers/types/Firefly.js';

interface BookmarkButtonProps extends Omit<ClickableButtonProps, 'onClick' | 'ref'> {
    nft: NftPreview;
}

export function BookmarkButton({ children, ...rest }: BookmarkButtonProps) {
    return <ClickableButton {...rest}>{children}</ClickableButton>;
}
