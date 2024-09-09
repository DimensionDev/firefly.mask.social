import { ArticleMarkup } from '@/components/Markup/ArticleMarkup.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { IS_APPLE, IS_SAFARI } from '@/constants/bowser.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { PreviewMediaModalRef } from '@/modals/controls.js';

interface Props {
    cover?: string;
    title: string;
    content?: string;
}

export function ArticleBody({ cover, title, content }: Props) {
    return (
        <div className="relative mt-[6px] flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-bg p-3">
            {cover ? (
                <ImageAsset
                    disableLoadHandler
                    src={cover}
                    width={510}
                    height={260}
                    className="mb-3 w-full cursor-pointer rounded-lg object-cover"
                    alt={cover}
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();

                        if (cover)
                            PreviewMediaModalRef.open({
                                medias: [{ type: 'Image', uri: cover }],
                                index: 0,
                                source: Source.Article,
                            });
                    }}
                />
            ) : null}
            <div
                className={classNames('line-clamp-2 text-base font-bold leading-[20px]', {
                    'max-h-[40px]': IS_SAFARI && IS_APPLE,
                })}
            >
                {title}
            </div>
            {content ? (
                <div className="h-[100px]">
                    <ArticleMarkup
                        disableImage
                        className="markup linkify break-words text-sm leading-[18px] text-second"
                    >
                        {content}
                    </ArticleMarkup>
                    <div
                        className="absolute bottom-0 left-0 h-[100px] w-full"
                        style={{
                            background: `linear-gradient(
                            to top,
                            rgba(var(--background-end-rgb), 1) 0%,
                            rgba(var(--background-end-rgb), 0.3) 50%,
                            rgba(var(--background-end-rgb), 0.15) 65%,
                            rgba(var(--background-end-rgb), 0.075) 75.5%,
                            rgba(var(--background-end-rgb), 0.037) 82.85%,
                            rgba(var(--background-end-rgb), 0.019) 88%,
                            rgba(var(--background-end-rgb), 0) 100%
                          )`,
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
}
