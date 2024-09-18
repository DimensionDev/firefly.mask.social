import { Trans } from '@lingui/macro';
import { forwardRef, useState } from 'react';

import { ArticleCollect } from '@/components/Article/ArticleCollect.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import { type SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { type Article } from '@/providers/types/Article.js';

export interface CollectArticleModalOpenProps {
    article: Article;
}

export const CollectArticleModal = forwardRef<SingletonModalRefCreator<CollectArticleModalOpenProps>>(
    function CollectArticleModal(_, ref) {
        const [props, setProps] = useState<CollectArticleModalOpenProps>();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                setProps({
                    article: props.article,
                });
            },
            onClose: () => {
                setProps(undefined);
            },
        });

        return (
            <Modal onClose={() => dispatch?.close()} open={open}>
                <div
                    className="relative w-[432px] max-w-[90vw] rounded-xl bg-lightBottom shadow-popover transition-all dark:bg-darkBottom dark:text-gray-950"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    <div className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-t-[12px] p-4">
                        <div className="relative h-6 w-6" />
                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                            <Trans>Collect Article</Trans>
                        </div>

                        <CloseButton
                            onClick={() => {
                                dispatch?.close();
                            }}
                        />
                    </div>

                    {props?.article ? <ArticleCollect article={props?.article} /> : null}
                </div>
            </Modal>
        );
    },
);
