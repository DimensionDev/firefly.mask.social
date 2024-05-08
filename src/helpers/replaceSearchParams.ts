/**
 * Updates the search parameters in the URL and replaces the current history state.
 * @param key The key of the search parameter to update.
 * @param value The new value for the search parameter.
 */
export function replaceSearchParams(params: URLSearchParams, pathname?: string) {
    const newSearchParams = new URLSearchParams(location.search);
    params.forEach((value, key) => newSearchParams.set(key, value));

    const newURL = `${pathname ?? location.pathname}?${newSearchParams}`;

    history.replaceState(
        {
            ...history.state,
            as: newURL,
            url: newURL,
        },
        '',
        newURL,
    );
}
