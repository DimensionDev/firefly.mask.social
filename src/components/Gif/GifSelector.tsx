import { SearchBar, SearchContextManager } from '@giphy/react-components';
import { t, Trans } from '@lingui/macro';
import { useCallback, useMemo, useState } from 'react';
import { useSize } from 'react-use';

import SearchIcon from '@/assets/search.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { EmojiList } from '@/components/Gif/EmojiList.js';
import { GifList } from '@/components/Gif/GifList.js';
import { GiphyTabType } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { FILE_MAX_SIZE_IN_BYTES } from '@/constants/index.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { createGiphyMediaObject } from '@/helpers/resolveMediaObjectUrl.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { IGif } from '@/types/giphy.js';

interface GifSelectorProps {
    onSelected: () => void;
}

function getGiphyMediaTabs() {
    return [
        { type: GiphyTabType.Gifs, label: t`GIFs` },
        { type: GiphyTabType.Stickers, label: t`Stickers` },
        { type: GiphyTabType.Text, label: t`Text` },
        { type: GiphyTabType.Emoji, label: t`Emoji` },
    ];
}

export function GifSelector({ onSelected }: GifSelectorProps) {
    const [tabType, setTabType] = useState<GiphyTabType>(GiphyTabType.Gifs);
    const { type, updateImages } = useComposeStateStore();
    const { availableSources } = useCompositePost();
    const [sizedFooter, { width }] = useSize(
        <div className="mt-2 flex items-center justify-end pr-3 text-[13px] font-bold text-lightSecond">
            <Trans>Powered by</Trans>
            <Image className="ml-2" alt="GIPHY" src="/image/giphy.png" width={12} height={12} />
            <span className="text-black dark:text-white">GIPHY</span>
        </div>,
    );

    const maxImageCount = getCurrentPostImageLimits(type, availableSources);

    const searchOptions = useMemo(
        () => ({
            type: tabType === GiphyTabType.Emoji ? GiphyTabType.Gifs : tabType,
        }),
        [tabType],
    );

    const onGifSelected = useCallback(
        (gif: IGif) => {
            const gifSize = gif.images.original.size;
            if (gifSize && parseFloat(gifSize) > FILE_MAX_SIZE_IN_BYTES) {
                enqueueErrorMessage(t`The file exceeds the size limit.`);
                return;
            }
            updateImages((images) => {
                if (images.length === maxImageCount) return images;
                return [...images, createGiphyMediaObject(gif)].slice(0, maxImageCount);
            });
            onSelected();
        },
        [maxImageCount, onSelected, updateImages],
    );

    return (
        <SearchContextManager
            apiKey={env.external.NEXT_PUBLIC_GIPHY_API_KEY}
            options={searchOptions}
            shouldFetchChannels={false}
        >
            <div className="h-[calc(100vh-56px-32px)] max-h-[calc(800px-56px-32px)]">
                {tabType !== GiphyTabType.Emoji ? (
                    <div className="relative mx-3 flex flex-grow items-center rounded-xl bg-lightBg pl-3 text-main">
                        <SearchIcon width={18} height={18} className="shrink-0 text-primaryMain" />
                        <div className="w-full flex-1">
                            <SearchBar className="ff-giphy-search-bar" placeholder={t`Search...`} />
                        </div>
                    </div>
                ) : null}
                <div
                    className={classNames('mt-2', {
                        'h-[calc(100%-130px)]': tabType !== GiphyTabType.Emoji,
                        'h-[calc(100%-130px+36px)]': tabType === GiphyTabType.Emoji,
                    })}
                >
                    {tabType === GiphyTabType.Emoji ? (
                        <EmojiList width={width - 24} onSelected={onGifSelected} />
                    ) : (
                        <GifList width={width - 24} onSelected={onGifSelected} />
                    )}
                </div>
                <div className="no-scrollbar mx-3 my-2.5 overflow-x-auto whitespace-nowrap rounded-3xl bg-lightBg px-4 py-1">
                    {getGiphyMediaTabs().map((mediaTab) => (
                        <ClickableButton
                            onClick={() => setTabType(mediaTab.type)}
                            key={mediaTab.type}
                            className={classNames('inline-block h-7 rounded-full px-4 text-base font-bold leading-7', {
                                'bg-lightBottom text-black': tabType === mediaTab.type,
                                'text-lightSecond': tabType !== mediaTab.type,
                            })}
                        >
                            {mediaTab.label}
                        </ClickableButton>
                    ))}
                </div>
                {sizedFooter}
            </div>
        </SearchContextManager>
    );
}
