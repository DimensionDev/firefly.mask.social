// TODO: og

import { ArticleDetailPage } from '@/app/(normal)/article/[id]/pages/DetailPage.js';

interface Props {
    params: {
        id: string;
    };
}

export default function Page(props: Props) {
    return <ArticleDetailPage {...props} />;
}
