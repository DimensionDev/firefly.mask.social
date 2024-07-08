import { Grid, SearchBar, SearchContext } from '@giphy/react-components';
import { t, Trans } from '@lingui/macro';
import { useCallback, useContext } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import SearchIcon from '@/assets/search.svg';
import { Image } from '@/esm/Image.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { createGiphyMediaObject } from '@/helpers/resolveMediaObjectUrl.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import type { IGif } from '@/types/giphy.js';

interface GifSelectorProps {
    onSelected: () => void;
}

function LoadingIndicator() {
    return (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center">
            <LoadingIcon width={24} height={24} className="animate-spin" />
        </div>
    );
}

export function GifSelector({ onSelected }: GifSelectorProps) {
    const { isFetching, fetchGifs, searchKey } = useContext(SearchContext);
    const { updateImages } = useComposeStateStore();
    const { availableSources } = useCompositePost();

    const maxImageCount = getCurrentPostImageLimits(availableSources);

    const onGifClick = useCallback(
        (gif: IGif) => {
            updateImages((images) => {
                if (images.length === maxImageCount) return images;
                return [...images, createGiphyMediaObject(gif)].slice(0, maxImageCount);
            });
            onSelected();
        },
        [maxImageCount, onSelected, updateImages],
    );

    return (
        <div>
            <div className="relative mx-3 flex flex-grow items-center rounded-xl bg-lightBg pl-3 text-main">
                <SearchIcon width={18} height={18} className="shrink-0 text-primaryMain" />
                <div className="w-full flex-1">
                    <SearchBar className="ff-giphy-search-bar" placeholder={t`Search...`} />
                </div>
            </div>
            <div className="relative mt-2 h-[218px] rounded">
                <div className="no-scrollbar h-full overflow-y-auto overflow-x-hidden px-3">
                    <Grid
                        className="ff-giphy-grid"
                        hideAttribution
                        noLink
                        key={searchKey}
                        columns={2}
                        width={255}
                        fetchGifs={fetchGifs}
                        onGifClick={onGifClick}
                    />
                </div>
                {isFetching ? <LoadingIndicator /> : null}
            </div>
            <div className="mt-2 flex items-center justify-end pr-3 text-[13px] font-bold text-lightSecond">
                <Trans>Powered by</Trans>
                <Image className="ml-2" alt="GIPHY" src="/image/giphy.png" width={12} height={12} />
                <span className="text-black dark:text-white">GIPHY</span>
            </div>
        </div>
    );
}
