import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse, userAgent } from 'next/server.js';
import urlcat from 'urlcat';

import { DEFAULT_SOCIAL_SOURCE, SITE_URL } from '@/constants/index.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isMatchedDiscoverPage } from '@/helpers/isMatchedDiscoverPage.js';
import { parseOldDiscoverUrl } from '@/helpers/parseDiscoverUrl.js';
import { parseOldEngagementUrl } from '@/helpers/parseEngagementUrl.js';
import { parseOldBookmarkUrl } from '@/helpers/parseOldBookmarkUrl.js';
import { parseOldFollowingUrl } from '@/helpers/parseOldFollowingUrl.js';
import { parseOldNftUrl } from '@/helpers/parseOldNftUrl.js';
import { parseOldNotification } from '@/helpers/parseOldNotification.js';
import { parseOldSettingsUrl } from '@/helpers/parseOldSettingsUrl.js';
import { parseOldPostUrl } from '@/helpers/parsePostUrl.js';
import { parseOldProfileUrl, parseProfileUrl } from '@/helpers/parseProfileUrl.js';
import { resolveBookmarkUrl } from '@/helpers/resolveBookmarkUrl.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { resolveEngagementUrl } from '@/helpers/resolveEngagementUrl.js';
import { resolveFollowingUrl } from '@/helpers/resolveFollowingUrl.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveNotificationUrl } from '@/helpers/resolveNotificationUrl.js';
import { resolvePostUrl } from '@/helpers/resolvePostUrl.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    request.headers.set('X-URL', request.url);

    if (request.nextUrl.host === 'cz.firefly.social' && pathname === '/') {
        return NextResponse.redirect(urlcat(SITE_URL, '/event/cz_welcome_back_airdrop'));
    }

    if (pathname === '/') {
        return NextResponse.redirect(new URL(resolveDiscoverUrl(DEFAULT_SOCIAL_SOURCE), request.url));
    }

    if (isMatchedDiscoverPage(pathname)) {
        return NextResponse.rewrite(new URL(`/discover${pathname}`, request.url), {
            request,
        });
    }

    const parsedOldDiscoverUrl = parseOldDiscoverUrl(request.nextUrl);
    if (parsedOldDiscoverUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolveDiscoverUrl(parsedOldDiscoverUrl.source, parsedOldDiscoverUrl.discover);
        destination.searchParams.delete('source');
        destination.searchParams.delete('discover');
        return NextResponse.redirect(destination);
    }

    const parsedOldNotificationUrl = parseOldNotification(request.nextUrl);
    if (parsedOldNotificationUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolveNotificationUrl(parsedOldNotificationUrl.source);
        destination.searchParams.delete('source');
        return NextResponse.redirect(destination);
    }

    const parsedOldFollowingUrl = parseOldFollowingUrl(request.nextUrl);
    if (parsedOldFollowingUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolveFollowingUrl(parsedOldFollowingUrl.source);
        destination.searchParams.delete('source');
        return NextResponse.redirect(destination, StatusCodes.PERMANENT_REDIRECT);
    }

    const parsedOldBookmarkUrl = parseOldBookmarkUrl(request.nextUrl);
    if (parsedOldBookmarkUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolveBookmarkUrl(parsedOldBookmarkUrl.source);
        destination.searchParams.delete('source');

        return NextResponse.redirect(destination);
    }

    const parsedOldProfileUrl = parseOldProfileUrl(request.nextUrl);
    if (parsedOldProfileUrl) {
        const destination = request.nextUrl.clone();

        destination.pathname = resolveProfileUrl(
            parsedOldProfileUrl.source,
            parsedOldProfileUrl.id,
            parsedOldProfileUrl.category,
        );

        destination.searchParams.delete('profile_tab');
        destination.searchParams.delete('wallet_tab');
        destination.searchParams.delete('source');
        return NextResponse.redirect(destination);
    }

    const parsedProfileUrl = parseProfileUrl(pathname);
    if (parsedProfileUrl?.category && isFollowCategory(parsedProfileUrl.category)) {
        const destination = new URL(
            urlcat(`/profile/:source/:id/relation/:category`, {
                ...parsedProfileUrl,
                source: resolveSourceInUrl(parsedProfileUrl.source),
            }),
            request.url,
        );
        return NextResponse.rewrite(destination, {
            request,
        });
    }

    const parsedOldEngagementUrl = parseOldEngagementUrl(request.nextUrl);
    if (parsedOldEngagementUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolveEngagementUrl(
            parsedOldEngagementUrl.id,
            parsedOldEngagementUrl.source,
            parsedOldEngagementUrl.engagement,
        );
        destination.searchParams.delete('source');
        return NextResponse.redirect(destination);
    }

    const parsedOldPostUrl = parseOldPostUrl(request.nextUrl);
    if (parsedOldPostUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolvePostUrl(parsedOldPostUrl.source, parsedOldPostUrl.id);
        destination.searchParams.delete('source');
        return NextResponse.redirect(destination);
    }

    const parsedOldNftUrl = parseOldNftUrl(request.nextUrl);
    if (parsedOldNftUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = resolveNftUrl(parsedOldNftUrl.chainId, parsedOldNftUrl.address, parsedOldNftUrl.tokenId);
        destination.searchParams.delete('chainId');
        return NextResponse.redirect(destination);
    }

    const parsedOldSettingsUrl = parseOldSettingsUrl(request.nextUrl);
    if (parsedOldSettingsUrl) {
        const destination = request.nextUrl.clone();
        destination.pathname = parsedOldSettingsUrl.pathname;
        return NextResponse.redirect(destination);
    }

    const isPost = pathname.startsWith('/post') && !pathname.includes('/photos');
    if (isPost) {
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
    matcher: [
        '/((?!_next/static|js|sw.js|site.webmanifest|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js)$).*)',
    ],
};
