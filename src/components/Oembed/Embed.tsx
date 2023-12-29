import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import type { OpenGraph } from '@/services/digestLink.js';

interface EmbedProps {
    og: OpenGraph;
}

export default function Embed({ og }: EmbedProps) {
    return (
        <div className="mt-4 text-sm">
            <Link
                onClick={(event) => event.stopPropagation()}
                href={og.url}
                target={og.url.includes(location.host) ? '_self' : '_blank'}
                rel="noreferrer noopener"
            >
                <div className=" rounded-xl border bg-white dark:border-gray-700 dark:bg-black">
                    {og.isLarge && og.image ? (
                        <Image
                            className="divider aspect-2 w-full rounded-t-xl object-cover"
                            src={og.image.base64 || og.image.url}
                            alt="Thumbnail"
                            width={og.image.width}
                            height={og.image.height}
                        />
                    ) : null}
                    <div className="flex items-center">
                        {!og.isLarge && og.image ? (
                            <Image
                                className="h-36 w-36 rounded-l-xl border-r dark:border-gray-700"
                                height={144}
                                width={144}
                                src={og.image.base64 || og.image.url}
                                alt="Thumbnail"
                            />
                        ) : null}
                        <div className="truncate p-5">
                            <div className="space-y-1.5">
                                {og.title ? <div className="truncate font-bold">{og.title}</div> : null}
                                {og.description ? (
                                    <div className="ld-text-gray-500 line-clamp-1 whitespace-break-spaces">
                                        {og.description}
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
