import { NFTCollectionPageById } from '@/app/(normal)/nft/pages/NFTCollectionPage.js';
import { createMetadataNFTCollectionById } from '@/helpers/createMetadataNFT.js';

interface Props {
    params: Promise<{
        chainIdOrCollectionId: string;
    }>;
}

export async function generateMetadata(props: Props) {
    const params = await props.params;
    const { chainIdOrCollectionId } = params;

    return createMetadataNFTCollectionById(chainIdOrCollectionId);
}

export default async function Page(props: Props) {
    const params = await props.params;
    return <NFTCollectionPageById collectionId={params.chainIdOrCollectionId} />;
}
