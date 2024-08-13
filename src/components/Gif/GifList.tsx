import { Grid, SearchContext, SuggestionBar } from '@giphy/react-components';
import { memo, useContext } from 'react';

import { LoadingIndicator } from '@/components/Gif/LoadingIndicator.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { IGif } from '@/types/giphy.js';

interface GifListProps {
    width: number;
    onSelected: (gif: IGif) => void;
}

export const GifList = memo<GifListProps>(function GifList({ width, onSelected }) {
    const { isFetching, fetchGifs, searchKey } = useContext(SearchContext);
    const isMedium = useIsMedium();

    return (
        <div className="relative h-full rounded">
            <div className="no-scrollbar h-full overflow-y-auto overflow-x-hidden px-3">
                <SuggestionBar />
                <Grid
                    className="ff-giphy-grid"
                    hideAttribution
                    noLink
                    key={searchKey}
                    columns={isMedium ? 3 : 2}
                    width={width}
                    fetchGifs={fetchGifs}
                    onGifClick={onSelected}
                />
            </div>
            {isFetching ? <LoadingIndicator /> : null}
        </div>
    );
});
