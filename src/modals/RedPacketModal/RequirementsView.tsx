import { t, Trans } from '@lingui/macro';
import { getEnumAsArray } from '@masknet/kit';
import { useRouter } from '@tanstack/react-router';
import React, { useCallback, useContext } from 'react';

import AddUser from '@/assets/add-user.svg';
import ArrowDown from '@/assets/arrow-down.svg';
import Comment from '@/assets/comment-rp.svg';
import InfoIcon from '@/assets/info.svg';
import Like from '@/assets/like.svg';
import NFTHolder from '@/assets/nft-holder.svg';
import Repost from '@/assets/repost.svg';
import { ActionButton } from '@/components/ActionButton.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Image } from '@/components/Image.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { NonFungibleTokenCollectionSelectModalRef } from '@/modals/controls.js';
import { RedPacketContext } from '@/modals/RedPacketModal/RedPacketContext.js';
import { RequirementType } from '@/providers/red-packet/types.js';

export const REQUIREMENT_ICON_MAP: Record<RequirementType, React.FunctionComponent<React.SVGAttributes<SVGElement>>> = {
    [RequirementType.Follow]: AddUser,
    [RequirementType.Like]: Like,
    [RequirementType.Repost]: Repost,
    [RequirementType.Comment]: Comment,
    [RequirementType.NFTHolder]: NFTHolder,
};

export function RequirementsView() {
    const REQUIREMENT_TITLE_MAP: Record<RequirementType, React.ReactNode> = {
        [RequirementType.Follow]: t`Follow me`,
        [RequirementType.Like]: t`Like`,
        [RequirementType.Repost]: t`Repost`,
        [RequirementType.Comment]: t`Comment`,
        [RequirementType.NFTHolder]: t`NFT holder`,
    };

    const { history } = useRouter();
    const { rules, setRules, requireCollection, setRequireCollection } = useContext(RedPacketContext);

    const hasNFTHolder = rules.includes(RequirementType.NFTHolder);

    const disabled = rules.includes(RequirementType.NFTHolder) && !requireCollection;

    const handleClick = useCallback(async () => {
        const result = await NonFungibleTokenCollectionSelectModalRef.openAndWaitForClose({
            selected: requireCollection,
        });
        if (!result) return;
        setRequireCollection(result);
    }, [requireCollection, setRequireCollection]);

    return (
        <>
            <div className="flex flex-1 flex-col gap-y-4 bg-primaryBottom px-4 pt-2">
                <div className="flex max-w-[568px] gap-x-[6px] rounded-[4px] bg-bg p-3">
                    <InfoIcon width={20} height={20} />
                    <div className="flex flex-col gap-[10px] text-start text-[13px] leading-[18px]">
                        <div>
                            <Trans>You can set one or multiple rules to be eligible to win a Lucky Drop.</Trans>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    {getEnumAsArray(RequirementType).map(({ value }) => {
                        const checked = rules.includes(value);
                        const Icon = REQUIREMENT_ICON_MAP[value];
                        const title = REQUIREMENT_TITLE_MAP[value];

                        return (
                            <div className="flex items-center gap-x-2 px-3 py-1" key={value}>
                                <Icon width={20} height={20} />
                                <div className="flex-1 text-start font-bold">{title}</div>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    className="h-5 w-5 cursor-pointer rounded-[4px] text-lightHighlight"
                                    onChange={(event) => {
                                        if (!checked && value === RequirementType.NFTHolder) {
                                            setRequireCollection(undefined);
                                        }

                                        setRules(
                                            event.currentTarget.checked
                                                ? [...rules, value]
                                                : rules.filter((x) => x !== value),
                                        );
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>

                {hasNFTHolder ? (
                    <ClickableArea
                        className="flex cursor-pointer items-center justify-between rounded-lg bg-bg p-3"
                        onClick={handleClick}
                    >
                        {requireCollection ? (
                            <div className="flex items-center gap-2">
                                {requireCollection?.iconURL ? (
                                    <Image
                                        width={24}
                                        height={24}
                                        alt={requireCollection.name}
                                        className="h-6 w-6 rounded-full"
                                        src={requireCollection.iconURL}
                                    />
                                ) : null}
                                {requireCollection?.name ? (
                                    <div className="text-[15px] font-bold leading-[20px] text-main">
                                        {requireCollection.name}
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="text-[15px] leading-[20px] text-third">
                                <Trans>Select NFT collection to gate access</Trans>
                            </div>
                        )}
                        <ArrowDown width={18} height={18} />
                    </ClickableArea>
                ) : null}
                <div className="flex justify-end">
                    <div
                        className="cursor-pointer text-base font-bold leading-[20px] text-lightHighlight"
                        onClick={() => {
                            setRules(EMPTY_LIST);
                        }}
                    >
                        <Trans>Clear all requirements</Trans>
                    </div>
                </div>
            </div>
            <div className="flex-grow" />
            <div className="w-full bg-lightBottom80 p-4 shadow-primary backdrop-blur-lg dark:shadow-primaryDark">
                <ActionButton
                    className="rounded-lg"
                    disabled={disabled}
                    onClick={() => {
                        history.push('/confirm');
                    }}
                >
                    <Trans>Next</Trans>
                </ActionButton>
            </div>
        </>
    );
}
