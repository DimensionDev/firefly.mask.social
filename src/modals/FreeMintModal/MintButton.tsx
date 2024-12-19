import { Trans } from '@lingui/macro';
import { memo, useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import type { MintMetadata, NFTAsset } from '@/providers/types/Firefly.js';

interface MintButtonProps {
    nft: NFTAsset;
    mintParams: MintMetadata;
}

export const MintButton = memo<MintButtonProps>(function MintButton({ mintParams }) {
    const [mintCount, setMintCount] = useState(1);

    return (
        <div className="mt-6 flex items-center gap-4">
            <div className="flex gap-2">
                <ClickableButton className="flex h-8 w-8 items-center justify-center rounded-full bg-main text-lightBottom" />
                <input
                    className="h-8 w-[62px] rounded-full border border-lightSecond text-center focus:border-highlight"
                    value={mintCount}
                    onChange={(event) => setMintCount(+event.target.value)}
                />
                <ClickableButton className="flex h-8 w-8 items-center justify-center rounded-full bg-main text-lightBottom" />
            </div>
            <ClickableButton className="h-8 flex-1 rounded-full bg-main text-center text-sm font-bold !leading-8 text-lightBottom">
                <Trans>Mint</Trans>
            </ClickableButton>
        </div>
    );
});
