export interface Pageable<Item, Indicator = unknown> {
    /** the indicator of the current page */
    indicator: Indicator;
    /** the indicator of the next page */
    nextIndicator?: Indicator;
    /** items data */
    data: Item[];
}

export interface PageIndicator {
    /** The id of the page. */
    cursor: string;
    /** The index number of the page. */
    index: number;
}

export function createIndicator(indicator?: PageIndicator, cursor?: string): PageIndicator {
    const index = indicator?.index ?? 0;
    return {
        cursor: cursor ?? indicator?.cursor ?? index.toString(),
        index,
    };
}

export function createNextIndicator(indicator?: PageIndicator, cursor?: string): PageIndicator {
    const index = (indicator?.index ?? 0) + 1;
    return typeof cursor === 'string'
        ? {
              cursor,
              index,
          }
        : {
              cursor: index.toString(),
              index,
          };
}

export function createPageable<Item, Indicator = PageIndicator>(
    data: Item[],
    indicator: Indicator,
    nextIndicator?: Indicator,
) {
    // with next page
    if (typeof nextIndicator !== 'undefined') {
        return {
            data,
            indicator,
            nextIndicator,
        };
    }
    // without next page
    return {
        data,
        indicator,
    };
}
