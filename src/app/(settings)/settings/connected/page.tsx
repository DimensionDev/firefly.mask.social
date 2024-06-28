'use client';

import { t, Trans } from '@lingui/macro';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { Fragment, useCallback, useRef } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';
import { useAccount } from 'wagmi';

import { AccountCard } from '@/app/(settings)/components/AccountCard.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import CopyIcon from '@/assets/copy.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useAccountsAll } from '@/hooks/useAccounts.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

export default function Connected() {
    const { address } = useAccount();

    const timerRef = useRef<NodeJS.Timeout>();

    const accountsAll = useAccountsAll();
    const currentProfileAll = useCurrentProfileAll();

    const [, copyToClipboard] = useCopyToClipboard();

    const handleClick = useCallback(() => {
        if (!address) return;
        copyToClipboard(address);
        enqueueSuccessMessage(t`Copied`);
    }, [address, copyToClipboard]);

    useNavigatorTitle(t`Connected Accounts`);

    return (
        <Section>
            <Headline>
                <Trans>Connected Accounts</Trans>
            </Headline>

            {SORTED_SOCIAL_SOURCES.map((x) => {
                const profile = currentProfileAll[x];

                return profile ? (
                    <Fragment key={profile.profileId}>
                        <div className="flex w-full items-center justify-between">
                            <span className="text-base font-bold leading-[18px] text-main">{resolveSourceName(x)}</span>
                            {x === Source.Lens ? (
                                <div className="flex items-center gap-1">
                                    <span className="text-base font-bold leading-[18px] text-second">
                                        {address ? formatEthereumAddress(address, 4) : null}
                                    </span>
                                    <Tooltip
                                        content={t`Click to copy`}
                                        placement="top"
                                        duration={200}
                                        trigger="click"
                                        onShow={(instance) => {
                                            if (timerRef.current) clearTimeout(timerRef.current);
                                            timerRef.current = setTimeout(() => {
                                                instance.hide();
                                            }, 1000);
                                        }}
                                    >
                                        <ClickableButton onClick={handleClick}>
                                            <CopyIcon width={14} height={14} />
                                        </ClickableButton>
                                    </Tooltip>
                                </div>
                            ) : null}
                        </div>
                        <div className="flex w-full flex-col gap-4">
                            {accountsAll[x].map((account) => (
                                <AccountCard
                                    key={account.profile.profileId}
                                    account={account}
                                    isCurrent={isSameProfile(profile, account.profile)}
                                />
                            ))}
                        </div>
                    </Fragment>
                ) : null;
            })}

            <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row">
                <ClickableButton
                    className="inline-flex h-10 w-full flex-col items-center justify-center md:w-[200px]"
                    onClick={() => {
                        LoginModalRef.open();
                    }}
                >
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-lightMain py-[11px]">
                        <div className="w-full text-[15px] font-bold leading-[18px] text-primaryBottom">
                            <Trans>Add account</Trans>
                        </div>
                    </div>
                </ClickableButton>

                <ClickableButton
                    className="inline-flex h-10 w-full flex-col items-start justify-start md:w-[200px]"
                    onClick={() => {
                        LogoutModalRef.open();
                    }}
                >
                    <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-danger px-[18px] py-[11px]">
                        <div className="text-[15px] font-bold leading-[18px] text-white dark:text-lightMain">
                            <Trans>Log out all</Trans>
                        </div>
                    </div>
                </ClickableButton>
            </div>
        </Section>
    );
}
