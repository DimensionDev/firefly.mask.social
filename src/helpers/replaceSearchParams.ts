/**
 * Updates the search parameters in the URL and replaces the current history state.
 * @param key The key of the search parameter to update.
 * @param value The new value for the search parameter.
 */
export function replaceSearchParams(params: URLSearchParams) {
    const newSearchParams = new URLSearchParams(location.search);
    params.forEach((key, value) => newSearchParams.set(key, value));

    const newURL = `${location.pathname}?${newSearchParams}`;

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
