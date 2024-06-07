import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { forwardRef } from 'react';

import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    article: Article;
}

export const WatchArticleButton = forwardRef<HTMLButtonElement, Props>(function WatchArticleButton(
    { article, ...rest }: Props,
    ref,
) {
    const isWatched = article.author.isFollowing;
    const mutation = useMutation({
        mutationFn: () => {
            if (isWatched) return FireflySocialMediaProvider.unwatchWallet(article.author.id);
            return FireflySocialMediaProvider.watchWallet(article.author.id);
        },
    });
    const identity = article.author.handle;
    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                await mutation.mutateAsync();
                rest.onClick?.();
            }}
            ref={ref}
        >
            {isWatched ? <EyeSlashIcon width={24} height={24} /> : <EyeIcon width={24} height={24} />}
            <span className="font-bold leading-[22px] text-main">
                {isWatched ? <Trans>Unwatch {identity}</Trans> : <Trans>Watch {identity}</Trans>}
            </span>
        </MenuButton>
    );
});
