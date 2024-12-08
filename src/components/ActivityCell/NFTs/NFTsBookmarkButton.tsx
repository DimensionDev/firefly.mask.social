import { ChainId } from '@masknet/web3-shared-evm';
import { useState } from 'react';

import BookmarkIcon from '@/assets/bookmark.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

interface Props {
    address: string;
    tokenId: string;
    chainId: ChainId;
}

export function NFTsBookmarkButton(props: Props) {
    const [bookmarked, setBookmarked] = useState(false); // TODO

    return (
        <ClickableButton
            className={classNames(
                'flex size-8 items-center justify-center rounded-xl bg-black/25 text-white',
                bookmarked ? 'text-warn' : 'hover:bg-warn/20 hover:text-warn active:bg-black/25 active:text-warn',
            )}
            onClick={() => setBookmarked((s) => !s)}
        >
            <BookmarkIcon
                fill={bookmarked ? 'rgb(var(--color-warn))' : 'none'}
                width={20}
                height={20}
                className="size-5"
            />
        </ClickableButton>
    );
}
