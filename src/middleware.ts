import { NextRequest, NextResponse, userAgent } from 'next/server.js';

export function middleware(request: NextRequest) {
    console.log('MATCHED!!!')

    const { isBot } = userAgent(request);

    console.log('DEBUG: isBot', isBot); 


    request.headers.set('X-IS-BOT', isBot ? 'true' : 'false');


    return NextResponse.next({
        request,
    });
}

export const config = {
    matcher: ['/post/:path*', '/profile/:path*'],
};
