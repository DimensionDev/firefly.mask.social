export function isRoutePathname(pathname: string, routePathname: `/${string}`) {
    // Check if both pathnames start with '/'
    if (!pathname.startsWith('/') || !routePathname.startsWith('/')) {
        return false;
    }

    // Remove trailing '/' from, if present and split the pathnames into parts
    const pathnameParts = pathname.replace(/\/$/, '').split('/');
    const routePathnameParts = routePathname.replace(/\/$/, '').split('/');

    // Check if the number of parts in routePathname is less than or equal to pathname
    if (routePathnameParts.length > pathnameParts.length) {
        return false;
    }

    // Check if the parts in routePathname are in the same sequence as in pathname
    for (let i = 0; i < routePathnameParts.length; i += 1) {
        if (routePathnameParts[i] !== pathnameParts[i]) {
            return false;
        }
    }

    // If all checks pass, the pathnames are considered identical
    return true;
}
