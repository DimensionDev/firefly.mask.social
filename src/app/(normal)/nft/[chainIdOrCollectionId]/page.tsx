import { NFTCollectionPageById } from '@/app/(normal)/nft/pages/NFTCollectionPage.js';
import { createMetadataNFTCollectionById } from '@/helpers/createMetadataNFT.js';

interface Props {
    params: {
        chainIdOrCollectionId: string;
    };
}

export async function generateMetadata({ params: { chainIdOrCollectionId } }: Props) {
    return createMetadataNFTCollectionById(chainIdOrCollectionId);
}

export default function Page({ params }: Props) {
    return <NFTCollectionPageById collectionId={params.chainIdOrCollectionId} />;
}
