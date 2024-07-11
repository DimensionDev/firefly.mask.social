import { Menu } from '@headlessui/react';
import { t } from '@lingui/macro';
import { memo } from 'react';
import { useEnsName } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import MoreIcon from '@/assets/more.svg';
import { BookmarkArticleButton } from '@/components/Actions/BookmarkArticleButton.js';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { ReportArticleButton } from '@/components/Actions/ReportArticleButton.js';
import { WatchWalletButton } from '@/components/Actions/WatchWalletButton.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tooltip } from '@/components/Tooltip.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { useToggleArticleBookmark } from '@/hooks/useToggleArticleBookmark.js';
import type { Article } from '@/providers/types/Article.js';

interface MoreProps {
    article: Article;
}

export const ArticleMoreAction = memo<MoreProps>(function ArticleMoreAction({ article }) {
    const mutation = useToggleArticleBookmark();
    const author = article.author;
    const isBusy = mutation.isPending;

    const { data: ens } = useEnsName({ address: author.id });
    const identity = author.handle || ens || formatEthereumAddress(author.id, 4);
    return (
        <MoreActionMenu
            button={
                isBusy ? (
                    <span className="inline-flex h-6 w-6 animate-spin items-center justify-center">
                        <LoadingIcon width={16} height={16} />
                    </span>
                ) : (
                    <Tooltip content={t`More`} placement="top">
                        <MoreIcon width={24} height={24} />
                    </Tooltip>
                )
            }
        >
            <Menu.Items
                className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }}
            >
                <Menu.Item>
                    {({ close }) => (
                        <BookmarkArticleButton
                            busy={mutation.isPending}
                            article={article}
                            onToggleBookmark={() => mutation.mutate(article)}
                            onClick={close}
                        />
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ close }) => (
                        <WatchWalletButton
                            identity={identity}
                            isFollowing={author.isFollowing}
                            address={author.id}
                            onClick={close}
                        />
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({ close }) => (
                        <MuteWalletButton
                            identity={identity}
                            isMuted={author.isMuted}
                            address={author.id}
                            onClick={close}
                        />
                    )}
                </Menu.Item>
                <Menu.Item>{({ close }) => <ReportArticleButton article={article} onClick={close} />}</Menu.Item>
            </Menu.Items>
        </MoreActionMenu>
    );
});
