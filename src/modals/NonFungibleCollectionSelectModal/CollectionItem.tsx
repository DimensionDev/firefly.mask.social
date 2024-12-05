import { t } from '@lingui/macro';
import { type NonFungibleCollection } from '@masknet/web3-shared-base';
import { ChainId, SchemaType } from '@masknet/web3-shared-evm';

import LinkIcon from '@/assets/link-square.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { EVMExplorerResolver } from '@/mask/bindings/index.js';

interface CollectionProps {
    collection: NonFungibleCollection<ChainId, SchemaType>;
}
export function CollectionItem({ collection }: CollectionProps) {
    const link = EVMExplorerResolver.addressLink(collection.chainId, collection.address!);
    return (
        <ClickableButton
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-bold text-lightMain"
            enablePropagate
        >
            <div className="flex items-center gap-x-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt={collection.name}
                    src={collection.iconURL!}
                    className="h-8 w-8 rounded-full object-contain"
                    height={24}
                    width={24}
                />
                <div className="text-left">
                    <span>{collection.name}</span>
                    <br />
                    <span className="text-[13px] text-lightSecond">{t`${collection.balance} items`}</span>
                </div>
            </div>
            <a href={link} target="_blank" className="ml-1 inline-block" onClick={(e) => e.stopPropagation()}>
                <LinkIcon className="h-3 w-3" />
            </a>
        </ClickableButton>
    );
}
