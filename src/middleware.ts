import { NextRequest, NextResponse, userAgent } from 'next/server.js';

import { isMatchedDiscoverPage } from '@/helpers/isMatchedDiscoverPage.js';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    request.headers.set('x-url', request.url);
    const isPost = pathname.startsWith('/post') && !pathname.includes('/photos');

    if (isPost) {
        const { isBot } = userAgent(request);

        request.headers.set('X-IS-BOT', isBot ? 'true' : 'false');

        return NextResponse.next({
            request,
        });
    }

    if (pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = `/discover/farcaster/trending`;
        return NextResponse.rewrite(url, {
            request,
        });
    }

    if (isMatchedDiscoverPage(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = `/discover${pathname}`;
        return NextResponse.rewrite(url, {
            request,
        });
    }

    return NextResponse.next({
        request,
    });
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
