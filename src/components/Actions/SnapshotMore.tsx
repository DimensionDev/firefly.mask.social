import { MenuItem, MenuItems } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { memo } from 'react';
import { useEnsName } from 'wagmi';

import BookmarkActiveIcon from '@/assets/bookmark.selected.svg';
import BookmarkIcon from '@/assets/bookmark.svg';
import LoadingIcon from '@/assets/loading.svg';
import MoreIcon from '@/assets/more.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MuteWalletButton } from '@/components/Actions/MuteWalletButton.js';
import { WatchWalletButton } from '@/components/Actions/WatchWalletButton.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Tips } from '@/components/Tips/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source } from '@/constants/enum.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { stopEvent } from '@/helpers/stopEvent.js';
import { useFireflyIdentity } from '@/hooks/useFireflyIdentity.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import { useToggleSnapshotBookmark } from '@/hooks/useToggleSnapshotBookmark.js';
import type { SnapshotActivity } from '@/providers/snapshot/type.js';

interface MoreProps {
    data: SnapshotActivity;
}

export const SnapshotMoreAction = memo<MoreProps>(function SnapshotMoreAction({ data }) {
    const mutation = useToggleSnapshotBookmark();
    const author = data.author;
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
            <MenuItems
                className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                onClick={stopEvent}
            >
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
                <MenuItem>
                    {({ close }) => (
                        <MenuButton
                            onClick={() => {
                                mutation.mutate(data);
                                close();
                            }}
                        >
                            {data.hasBookmarked ? (
                                <BookmarkActiveIcon width={18} height={18} className="text-lightMain" />
                            ) : (
                                <BookmarkIcon width={18} height={18} />
                            )}
                            <span className="font-bold leading-[22px] text-main">
                                {data.hasBookmarked ? <Trans>Remove from Bookmarks</Trans> : <Trans>Bookmark</Trans>}
                            </span>
                        </MenuButton>
                    )}
                </MenuItem>
                <MenuItem>
                    {({ close }) => (
                        <Tips
                            className="px-3 py-1 !text-main hover:bg-bg"
                            identity={identity}
                            handle={ens}
                            tooltipDisabled
                            label={t`Send a tip`}
                            onClick={close}
                            pureWallet
                        />
                    )}
                </MenuItem>
            </MenuItems>
        </MoreActionMenu>
    );
});