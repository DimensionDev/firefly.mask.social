import { Trans } from '@lingui/macro';

export function ActivityRules() {
    return (
        <div className="w-full rounded-2xl border border-line p-3">
            <h2 className="mb-2 text-base font-semibold leading-6">
                <Trans>About Airdrop</Trans>
            </h2>
            <ul className="list-decimal pl-4 text-sm font-medium leading-6">
                <li>
                    <Trans>
                        Priority Access: Holders get early access to future projects, beta tests, and airdrops. And they
                        will also have a first look at the latest features and content.
                    </Trans>
                </li>
                <li>
                    <Trans>
                        Core Asset Access: Unlock premium tokens, exclusive NFTs, and nodes for more investment
                        opportunities.
                    </Trans>
                </li>
                <li>
                    <Trans>
                        Voting Rights: Participate in key decisions and shape the platform’s development through
                        community governance.
                    </Trans>
                </li>
            </ul>
        </div>
    );
}
