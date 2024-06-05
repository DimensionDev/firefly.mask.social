import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { forwardRef } from 'react';

import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Article } from '@/providers/types/Article.js';
import { WatchType } from '@/providers/types/Firefly.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    article: Article;
}

export const ArticleWatchButton = forwardRef<HTMLButtonElement, Props>(function ArticleWatchButton(
    { article, ...rest }: Props,
    ref,
) {
    const isWatched = article.author.isFollowing;
    const mutation = useMutation({
        mutationFn: () => {
            if (isWatched) return FireflySocialMediaProvider.unwatch(WatchType.Wallet, article.author.id);
            return FireflySocialMediaProvider.watch(WatchType.Wallet, article.author.id);
        },
    });
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
                {isWatched ? <Trans>Unwatch</Trans> : <Trans>Watch</Trans>}
            </span>
        </MenuButton>
    );
});
