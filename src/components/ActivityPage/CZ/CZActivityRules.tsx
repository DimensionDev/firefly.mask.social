import { Trans } from '@lingui/macro';

import InfoIcon from '@/assets/info.svg';

export function CZActivityRules() {
    return (
        <div className="flex w-full flex-col space-y-6 text-sm">
            <div className="flex space-x-2 rounded-[8px] bg-lightBg p-3">
                <InfoIcon width={20} height={20} />
                <p className="text-sm leading-[18px]">
                    <Trans>
                        The event will run from September 28, 2024, 14:00 (UTC+8) to October 8, 2024, 23:59 (UTC).
                    </Trans>
                </p>
            </div>
            <div className="space-y-3">
                <h3 className="font-bold">
                    <Trans>Followed @cz_binance on X</Trans>
                </h3>
                <p>
                    <Trans>
                        Your current X account must follow <b>@cz_binance</b> to qualify, and it will be upgraded to the
                        Premium airdrop if it is <b>X Premium Account</b>.
                    </Trans>
                </p>
            </div>
            <div className="space-y-3">
                <h3 className="font-bold">
                    <Trans>Owned a .bnb domain</Trans>
                </h3>
                <p>
                    <Trans>
                        Your current wallet must own a .bnb domain to qualify, and it will be upgraded to the Premium
                        airdrop if the domain is a <b>SPACE ID Premier Club member</b>.
                    </Trans>
                </p>
            </div>
            <div className="space-y-3">
                <h3 className="font-bold">
                    <Trans>BNB Chain asset holder</Trans>
                </h3>
                <p>
                    <Trans>
                        You will be upgraded to the Premium airdrop if the assets in your current wallet on the BNB
                        Chain are valued at over <b>US$10,000</b>.
                    </Trans>
                </p>
            </div>
            <div className="space-y-3">
                <h3 className="font-bold">
                    <Trans>Firefly user</Trans>
                </h3>
                <p>
                    <Trans>You will be upgraded to the Premium airdrop if you are an elite Firefly user.</Trans>
                </p>
            </div>
        </div>
    );
}
