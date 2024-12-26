import { t, Trans } from '@lingui/macro';
import { forwardRef, memo } from 'react';

import BookmarkActiveIcon from '@/assets/bookmark.selected.svg';
import BookmarkIcon from '@/assets/bookmark.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { FireflyPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useHasBookmarked } from '@/hooks/useHasBookmarked.js';
import { useToggleNFTBookmark } from '@/hooks/useToggleNFTBookmark.js';
import { ConfirmModalRef } from '@/modals/controls.js';

interface BookmarkButtonProps extends Omit<ClickableButtonProps, 'ref' | 'children'> {
    nftId: string;
    ownerAddress?: string;
    bookmarked?: boolean;
    children?: (hasBookmarked: boolean, isLoading: boolean, fetching: boolean) => React.ReactNode;
    onClick?: () => void;
}

export const BookmarkButton = forwardRef<HTMLButtonElement, BookmarkButtonProps>(function BookmarkButton(
    { children, nftId, ownerAddress = '', bookmarked, onClick, ...rest },
    ref,
) {
    const disableFetch = bookmarked !== undefined;
    const { isLoading, data = false } = useHasBookmarked(FireflyPlatform.NFTs, nftId, undefined, disableFetch);

    const [isMutating, mutation] = useToggleNFTBookmark({
        owner: ownerAddress,
        nftId,
    });

    const hasBookmarked = disableFetch ? bookmarked : data;

    return (
        <ClickableButton
            {...rest}
            ref={ref}
            disabled={isMutating || isLoading}
            onClick={async () => {
                const confirmed = hasBookmarked
                    ? await ConfirmModalRef.openAndWaitForClose({
                          title: t`Remove from Bookmarks`,
                          content: (
                              <div className="text-main">
                                  <Trans>Are you sure you want to remove this NFT from your bookmark?</Trans>
                              </div>
                          ),
                          variant: 'normal',
                      })
                    : true;
                if (!confirmed) return;
                await mutation.mutateAsync(hasBookmarked);
                onClick?.();
            }}
        >
            {children?.(hasBookmarked, isMutating, isLoading)}
        </ClickableButton>
    );
});

function BookmarkButtonIcon({ hasBookmarked, isLoading }: { hasBookmarked: boolean; isLoading: boolean }) {
    return isLoading ? (
        <LoadingIcon width={20} height={20} className="animate-spin" />
    ) : hasBookmarked ? (
        <BookmarkActiveIcon width={20} height={20} className="text-warn" />
    ) : (
        <BookmarkIcon width={20} height={20} />
    );
}

export const BookmarkInIcon = memo(function BookmarkInIcon({ ...rest }: BookmarkButtonProps) {
    return (
        <BookmarkButton {...rest}>
            {(bookmarked: boolean, isLoading: boolean, fetching: boolean) => (
                <span
                    className={classNames(
                        'flex size-8 items-center justify-center rounded-xl bg-black/25 text-white',
                        bookmarked
                            ? 'text-warn'
                            : 'hover:bg-warn/20 hover:text-warn active:bg-black/25 active:text-warn',
                    )}
                >
                    {isLoading || fetching ? (
                        <LoadingIcon className="animate-spin" width={20} height={20} />
                    ) : (
                        <BookmarkIcon
                            fill={bookmarked ? 'rgb(var(--color-warn))' : 'none'}
                            width={20}
                            height={20}
                            className={classNames('size-5', bookmarked ? 'text-warn' : '')}
                        />
                    )}
                </span>
            )}
        </BookmarkButton>
    );
});

export const BookmarkInMenu = forwardRef<HTMLButtonElement, BookmarkButtonProps>(function BookmarkInMenu(
    { className, ...rest },
    ref,
) {
    return (
        <BookmarkButton
            {...rest}
            className={classNames('flex h-8 cursor-pointer items-center space-x-2 px-3 py-1 hover:bg-bg', className)}
            ref={ref}
        >
            {(hasBookmarked: boolean, isLoading: boolean, fetching: boolean) => (
                <>
                    <BookmarkButtonIcon hasBookmarked={hasBookmarked} isLoading={isLoading || fetching} />
                    <span className="font-bold leading-[22px] text-main">
                        {hasBookmarked ? <Trans>Remove from Bookmarks</Trans> : <Trans>Bookmark</Trans>}
                    </span>
                </>
            )}
        </BookmarkButton>
    );
});
