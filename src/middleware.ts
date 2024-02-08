import { NextRequest, NextResponse, userAgent } from 'next/server.js';
import urlcat from 'urlcat';

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/hubble')) {
        const u = new URL(request.url);

        const newHeaders = new Headers(request.headers);
        if (process.env.HUBBLE_TOKEN) newHeaders.set('api_token', process.env.HUBBLE_TOKEN);

        return NextResponse.next({
            request: new Request(urlcat(process.env.HUBBLE_URL, u.pathname.replace('/api/hubble', '') + u.search), {
                ...request,
                headers: newHeaders,
            }),
        });
    }

    if (request.nextUrl.pathname.startsWith('/post') || request.nextUrl.pathname.startsWith('/profile')) {
        const { isBot } = userAgent(request);

        request.headers.set('X-IS-BOT', isBot ? 'true' : 'false');

        return NextResponse.next({
            request,
        });
    }

    return NextResponse.next({
        request,
    });
}

export const config = {
    matcher: ['/post/:path*', '/profile/:path*', '/api/hubble/:path*'],
};
