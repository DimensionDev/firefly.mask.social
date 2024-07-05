import { Menu, Transition } from '@headlessui/react';
import { t } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { motion } from 'framer-motion';
import { Fragment, memo } from 'react';
import { useEnsName } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import MoreIcon from '@/assets/more.svg';
import { BookmarkArticleButton } from '@/components/Actions/BookmarkArticleButton.js';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { ReportArticleButton } from '@/components/Actions/ReportArticleButton.js';
import { WatchWalletButton } from '@/components/Actions/WatchWalletButton.js';
import { Tips } from '@/components/Tips/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source } from '@/constants/enum.js';
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
        <Menu
            className="relative"
            as="div"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <Menu.Button
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
                onClick={async (event) => {
                    event.stopPropagation();
                }}
            >
                {isBusy ? (
                    <span className="inline-flex h-6 w-6 animate-spin items-center justify-center">
                        <LoadingIcon width={16} height={16} />
                    </span>
                ) : (
                    <Tooltip content={t`More`} placement="top">
                        <MoreIcon width={24} height={24} />
                    </Tooltip>
                )}
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
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
                    <Menu.Item>
                        {({ close }) => (
                            <Tips
                                className="px-3 py-1 hover:bg-bg"
                                identity={author.id}
                                source={Source.Wallet}
                                handle={author.handle || ens}
                                tooltipDisabled
                                label={t`Send tips`}
                                onClick={close}
                                pureWallet
                            />
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
});
