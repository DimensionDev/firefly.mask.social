'use client';

import { t, Trans } from '@lingui/macro';
import { Fragment } from 'react';

import { AccountCard } from '@/app/(settings)/components/AccountCard.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useAccountsAll } from '@/hooks/useAccounts.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { LoginModalRef, LogoutModalRef } from '@/modals/controls.js';

export default function Connected() {
    const accountsAll = useAccountsAll();
    const currentProfileAll = useCurrentProfileAll();

    useNavigatorTitle(t`Connected accounts`);

    return (
        <Section>
            <Headline>
                <Trans>Connected accounts</Trans>
            </Headline>

            {SORTED_SOCIAL_SOURCES.map((x) => {
                const profile = currentProfileAll[x];

                return profile ? (
                    <Fragment key={profile.profileId}>
                        <div className="flex w-full items-center justify-between">
                            <span className="text-base font-bold leading-[18px] text-main">{resolveSourceName(x)}</span>
                        </div>
                        <AccountCard source={x} />
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
                        <div className="w-full text-medium font-bold leading-[18px] text-primaryBottom">
                            <Trans>Add account</Trans>
                        </div>
                    </div>
                </ClickableButton>

                {SORTED_SOCIAL_SOURCES.flatMap((x) => accountsAll[x]).length ? (
                    <ClickableButton
                        className="inline-flex h-10 w-full flex-col items-start justify-start md:w-[200px]"
                        onClick={() => {
                            LogoutModalRef.open();
                        }}
                    >
                        <div className="inline-flex h-10 items-center justify-center gap-2 self-stretch rounded-2xl bg-danger px-[18px] py-[11px]">
                            <div className="text-medium font-bold leading-[18px] text-white dark:text-lightMain">
                                <Trans>Log out all</Trans>
                            </div>
                        </div>
                    </ClickableButton>
                ) : null}
            </div>
        </Section>
    );
}
