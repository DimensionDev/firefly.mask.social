import { t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import RadioYesIcon from '@/assets/radio.yes.svg';
import { Avatar } from '@/components/Avatar.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { switchAccount } from '@/helpers/account.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useAccounts } from '@/hooks/useAccounts.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import type { Account } from '@/providers/types/Account.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface PostByItemProps {
    source: SocialSource;
    disabled?: boolean;
}

export function PostByItem({ source, disabled = false }: PostByItemProps) {
    const accounts = useAccounts(source);
    const currentProfile = useCurrentProfile(source);

    const { enableSource, disableSource } = useComposeStateStore();
    const { availableSources, images } = useCompositePost();

    const [{ loading }, login] = useAsyncFn(async (account: Account) => {
        try {
            await switchAccount(account);
            enqueueSuccessMessage(t`Your ${resolveSourceName(account.profile.source)} account is now connected.`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login.`), {
                error,
            });
            throw error;
        }
    }, []);

    if (!currentProfile || !accounts?.length)
        return (
            <div className="shrink-0 px-3 py-2 md:px-0">
                <div className="box-content flex h-6 items-center justify-between px-2 py-1 hover:bg-bg">
                    <div className="flex items-center gap-2 text-main">
                        <SocialSourceIcon size={24} source={source} />
                        <span className="font-bold text-main">{resolveSourceName(source)}</span>
                    </div>

                    <ClickableButton
                        className="font-bold text-farcasterPrimary"
                        onClick={async () => {
                            if (source === Source.Farcaster && images.length > 2) {
                                enqueueErrorMessage(t`Only up to 2 images can be chosen.`);
                                return;
                            }

                            ComposeModalRef.close();
                            await delay(300);
                            LoginModalRef.open({
                                source,
                            });
                        }}
                    >
                        <Trans>Login</Trans>
                    </ClickableButton>
                </div>
            </div>
        );

    return accounts.map(({ profile, session }) => (
        <div
            className="shrink-0 px-3 py-2 md:px-0"
            key={profile.profileId}
            onClick={() => {
                if (!isSameProfile(currentProfile, profile) || disabled) return;
                if (availableSources.includes(currentProfile.source)) disableSource(currentProfile.source);
                else enableSource(currentProfile.source);
            }}
        >
            <div
                className={classNames(
                    'box-content flex h-6 items-center justify-between px-2 py-1 hover:bg-bg',
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                )}
            >
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Avatar src={profile.pfp} size={24} alt={profile.handle} />
                        <SocialSourceIcon
                            className="absolute -bottom-1 -right-1 z-10 rounded-full border border-white dark:border-gray-900"
                            source={profile.source}
                            size={12}
                        />
                    </div>
                    <span
                        className={classNames(
                            'font-bold',
                            isSameProfile(currentProfile, profile) ? 'text-main' : 'text-secondary',
                        )}
                    >
                        @{profile.handle}
                    </span>
                </div>
                {isSameProfile(currentProfile, profile) ? (
                    availableSources.includes(currentProfile.source) ? (
                        <RadioYesIcon width={18} height={18} className="relative" />
                    ) : (
                        <RadioDisableNoIcon width={18} height={18} className="text-secondaryLine" />
                    )
                ) : (
                    <ClickableButton
                        className="font-bold text-farcasterPrimary"
                        disabled={loading}
                        onClick={() => login({ profile, session })}
                    >
                        {loading ? (
                            <LoadingIcon className="animate-spin" width={24} height={24} />
                        ) : (
                            <Trans>Switch</Trans>
                        )}
                    </ClickableButton>
                )}
            </div>
        </div>
    ));
}
