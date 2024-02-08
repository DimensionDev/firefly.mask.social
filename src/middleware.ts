import { NextRequest, NextResponse, userAgent } from 'next/server.js';
import urlcat from 'urlcat';

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/hubble')) {
        const u = new URL(request.url);

        const newHeaders = new Headers(request.headers);
        if (process.env.HUBBLE_TOKEN) newHeaders.set('api_key', process.env.HUBBLE_TOKEN);

        const newUrl = urlcat(process.env.HUBBLE_URL, u.pathname.replace('/api/hubble', '') + u.search);

        const response = await fetch(
            new Request(newUrl, {
                ...request,
                headers: newHeaders,
            }),
        );
        return response;
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
