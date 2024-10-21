import { MenuItem } from '@headlessui/react';
import { t } from '@lingui/macro';
import { memo } from 'react';
import { useEnsName } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import MoreIcon from '@/assets/more.svg';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { ReportArticleButton } from '@/components/Actions/ReportArticleButton.js';
import { WatchWalletButton } from '@/components/Actions/WatchWalletButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source } from '@/constants/enum.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import { useToggleArticleBookmark } from '@/hooks/useToggleArticleBookmark.js';
import type { Article } from '@/providers/types/Article.js';

interface MoreProps {
    article: Article;
}

export const ArticleMoreAction = memo<MoreProps>(function ArticleMoreAction({ article }) {
    const mutation = useToggleArticleBookmark();
    const author = article.author;
    const isBusy = mutation.isPending;

    const identity = useFireflyIdentity(Source.Wallet, author.id);
    const isMyProfile = useIsMyRelatedProfile(identity.source, identity.id);

    const { data: ens } = useEnsName({ address: author.id });
    const handleOrEnsOrAddress = author.handle || ens || formatAddress(author.id, 4);

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
            <MenuGroup>
                {!isMyProfile && (
                    <>
                        <MenuItem>
                            {({ close }) => (
                                <WatchWalletButton
                                    handleOrEnsOrAddress={handleOrEnsOrAddress}
                                    isFollowing={author.isFollowing}
                                    address={author.id}
                                    onClick={close}
                                />
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ close }) => (
                                <MuteWalletButton
                                    handleOrEnsOrAddress={handleOrEnsOrAddress}
                                    isMuted={author.isMuted}
                                    address={author.id}
                                    onClick={close}
                                />
                            )}
                        </MenuItem>
                    </>
                )}
                <MenuItem>{({ close }) => <ReportArticleButton article={article} onClick={close} />}</MenuItem>
            </MenuGroup>
        </MoreActionMenu>
    );
});
