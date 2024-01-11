import { NextRequest, NextResponse, userAgent } from 'next/server.js';

export function middleware(request: NextRequest) {
    const { isBot } = userAgent(request);

    request.headers.set('X-IS-BOT', isBot ? 'true' : 'false');

    return NextResponse.next({
        request,
    });
}

export const config = {
    matcher: ['/post/:path*', '/profile/:path*'],
};
