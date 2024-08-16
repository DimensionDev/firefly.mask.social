export const WrtingNFTQuery = {
    operationName: 'WritingNFT',
    query: `
      query WritingNFT($digest: String!) {
        entry(digest: $digest) {
          _id
          digest
          entryId
          arweaveTransactionRequest {
            transactionId
            __typename
          }
          writingNFT {
            ...writingNFTDetails
            media {
              ...mediaAsset
              __typename
            }
            network {
              ...networkDetails
              __typename
            }
            intents {
              ...writingNFTPurchaseDetails
              __typename
            }
            purchases {
              ...writingNFTPurchaseDetails
              __typename
            }
            factoryAddress
            __typename
          }
          __typename
        }
      }
  
      fragment writingNFTDetails on WritingNFTType {
        _id
        contractURI
        contentURI
        deploymentSignature
        deploymentSignatureType
        description
        digest
        fee
        fundingRecipient
        imageURI
        canMint
        media {
          id
          cid
          __typename
        }
        nonce
        optimisticNumSold
        owner
        price
        proxyAddress
        publisher {
          project {
            ...writingNFTProjectDetails
            __typename
          }
          __typename
        }
        quantity
        renderer
        signature
        symbol
        timestamp
        title
        version
        network {
          ...networkDetails
          __typename
        }
        __typename
      }
  
      fragment writingNFTProjectDetails on ProjectType {
        _id
        address
        avatarURL
        displayName
        domain
        ens
        description
        __typename
      }
  
      fragment networkDetails on NetworkType {
        _id
        chainId
        __typename
      }
  
      fragment mediaAsset on MediaAssetType {
        id
        cid
        mimetype
        sizes {
          ...mediaAssetSizes
          __typename
        }
        url
        __typename
      }
  
      fragment mediaAssetSizes on MediaAssetSizesType {
        og {
          ...mediaAssetSize
          __typename
        }
        lg {
          ...mediaAssetSize
          __typename
        }
        md {
          ...mediaAssetSize
          __typename
        }
        sm {
          ...mediaAssetSize
          __typename
        }
        __typename
      }
  
      fragment mediaAssetSize on MediaAssetSizeType {
        src
        height
        width
        __typename
      }
  
      fragment writingNFTPurchaseDetails on WritingNFTPurchaseType {
        numSold
        __typename
      }
    `,
};
