import { LinkIcon } from '@heroicons/react/24/outline';

import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isSelfReference } from '@/helpers/isLinkMatchingHost.js';
import { parseURL } from '@/helpers/parseURL.js';
import type { OpenGraph } from '@/types/og.js';

interface EmbedProps {
    og: OpenGraph;
}

export function Embed({ og }: EmbedProps) {
    const u = parseURL(og.url);
    if (!u) return null;

    const imageProps = og.image
        ? {
              width: og.image.width,
              height: og.image.height,
              src: og.image.base64 || og.image.url,
          }
        : null;

    return (
        <div className="mt-4 max-w-full text-sm">
            <Link
                onClick={(event) => event.stopPropagation()}
                href={u}
                target={isSelfReference(og.url) ? '_self' : '_blank'}
                rel="noreferrer noopener"
            >
                <div className="rounded-xl border bg-white text-main dark:border-gray-700 dark:bg-black">
                    {og.isLarge && imageProps ? (
                        <Image className="divider aspect-2 w-full rounded-xl object-cover" {...imageProps} alt="" />
                    ) : null}
                    <div className="flex items-center">
                        {!og.isLarge ? (
                            <div
                                className={classNames(
                                    'relative flex aspect-square h-20 shrink-0 items-center justify-center',
                                    {
                                        'md:h-36': !!imageProps, // card
                                        'md:h-24': !imageProps, // link
                                    },
                                )}
                            >
                                {imageProps ? (
                                    <Image
                                        className="rounded-l-xl border-r object-cover dark:border-gray-700"
                                        layout="fill"
                                        src={imageProps.src}
                                        alt=""
                                    />
                                ) : (
                                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-md bg-bg">
                                        <LinkIcon className="h-6 w-6 text-gray-500" />
                                    </div>
                                )}
                            </div>
                        ) : null}
                        <div
                            className={classNames('truncate p-2 text-left text-second', {
                                'md:p-5': !!imageProps, // card
                                'md:px-3 md:py-5': !imageProps, // link
                            })}
                        >
                            <div className="space-y-1.5">
                                <div className="truncate font-bold">{og.title || u.host}</div>
                                {og.description || u.hostname ? (
                                    <div className="ld-text-gray-500 line-clamp-1 whitespace-break-spaces">
                                        {og.description || u.hostname}
                                    </div>
                                ) : null}
                                {og.site ? (
                                    <div className="flex items-center space-x-2 pt-1.5">
                                        {og.favicon ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                className="h-4 w-4 rounded-full"
                                                height={16}
                                                width={16}
                                                src={og.favicon}
                                                alt="Favicon"
                                            />
                                        ) : null}
                                        <div className="ld-text-gray-500 text-xs">{og.site}</div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
