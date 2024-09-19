import { NextRequest, NextResponse, userAgent } from 'next/server.js';
import urlcat from 'urlcat';

import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isMatchedDiscoverPage } from '@/helpers/isMatchedDiscoverPage.js';
import { parseOldPostUrl } from '@/helpers/parsePostUrl.js';
import { parseProfileUrl } from '@/helpers/parseProfileUrl.js';
import { resolvePostUrl } from '@/helpers/resolvePostUrl.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';

export async function middleware(request: NextRequest) {
    request.headers.set('X-URL', request.url);

    const pathname = request.nextUrl.pathname;
    const isPost = pathname.startsWith('/post') && !pathname.includes('/photos');

    if (isPost) {
        const { isBot } = userAgent(request);

        request.headers.set('X-IS-BOT', isBot ? 'true' : 'false');

        return NextResponse.next({
            request,
        });
    }

    if (isMatchedDiscoverPage(pathname)) {
        return NextResponse.rewrite(new URL(`/discover${pathname}`, request.url), {
            request,
        });
    }

    const parsedProfileUrl = parseProfileUrl(pathname);
    if (parsedProfileUrl?.category && isFollowCategory(parsedProfileUrl.category)) {
        const destination = new URL(
            urlcat(`/profile/:source/:id/relation/:category`, {
                ...parsedProfileUrl,
                source: resolveSourceInURL(parsedProfileUrl.source),
            }),
            request.url,
        );
        return NextResponse.rewrite(destination, {
            request,
        });
    }

    const parsedOldPostUrl = parseOldPostUrl(request.nextUrl);
    if (parsedOldPostUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolvePostUrl(parsedOldPostUrl.source, request.url);
        return NextResponse.redirect(destination);
    }

    return NextResponse.next({
        request,
    });
}

export const config = {
    matcher: [
        '/((?!_next/static|js|sw.js|site.webmanifest|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js)$).*)',
    ],
};
