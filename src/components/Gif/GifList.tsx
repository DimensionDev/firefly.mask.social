import { Grid, SearchContext, SuggestionBar } from '@giphy/react-components';
import { memo, useContext } from 'react';

import { LoadingIndicator } from '@/components/Gif/LoadingIndicator.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { IGif } from '@/types/giphy.js';

interface GifListProps {
    onSelected: (gif: IGif) => void;
}

export const GifList = memo<GifListProps>(function GifList({ onSelected }) {
    const { isFetching, fetchGifs, searchKey } = useContext(SearchContext);
    const isMedium = useIsMedium();

    return (
        <div className="relative mt-2 h-[180px] rounded md:h-[218px]">
            <div className="no-scrollbar h-full overflow-y-auto overflow-x-hidden px-3">
                <SuggestionBar />
                <Grid
                    className="ff-giphy-grid"
                    hideAttribution
                    noLink
                    key={searchKey}
                    columns={isMedium ? 4 : 2}
                    width={isMedium ? 542 : 255}
                    fetchGifs={fetchGifs}
                    onGifClick={onSelected}
                />
            </div>
            {isFetching ? <LoadingIndicator /> : null}
        </div>
    );
});
