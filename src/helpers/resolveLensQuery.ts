import { createLookupTableResolver } from '@masknet/shared-base';

import { UnreachableError } from '@/constants/error.js';
import { type ComposeType } from '@/types/compose.js';

export const resolveLensOperationName = createLookupTableResolver<
    ComposeType,
    'PostOnMomoka' | 'QuoteOnMomoka' | 'CommentOnMomoka'
>(
    {
        compose: 'PostOnMomoka',
        quote: 'QuoteOnMomoka',
        reply: 'CommentOnMomoka',
    },
    (type: ComposeType) => {
        throw new UnreachableError('composeType', type);
    },
);

export const resolveLensQuery = createLookupTableResolver<ComposeType, string>(
    {
        compose: `mutation PostOnMomoka($request: MomokaPostRequest!) {
            result: postOnMomoka(request: $request) {
                ... on CreateMomokaPublicationResult {
                ...CreateMomokaPublicationResult
                }
                ... on LensProfileManagerRelayError {
                ...LensProfileManagerRelayError
                }
            }
            }

            fragment LensProfileManagerRelayError on LensProfileManagerRelayError {
            __typename
            reason
            }

            fragment CreateMomokaPublicationResult on CreateMomokaPublicationResult {
            __typename
            id
            proof
            momokaId
            }
        `,
        quote: `mutation QuoteOnMomoka($request: MomokaQuoteRequest!) {
            result: quoteOnMomoka(request: $request) {
                ... on CreateMomokaPublicationResult {
                ...CreateMomokaPublicationResult
                }
                ... on LensProfileManagerRelayError {
                ...LensProfileManagerRelayError
                }
            }
            }

            fragment LensProfileManagerRelayError on LensProfileManagerRelayError {
            __typename
            reason
            }

            fragment CreateMomokaPublicationResult on CreateMomokaPublicationResult {
            __typename
            id
            proof
            momokaId
            }`,
        reply: `mutation CommentOnMomoka($request: MomokaCommentRequest!) {
            result: commentOnMomoka(request: $request) {
                ... on CreateMomokaPublicationResult {
                ...CreateMomokaPublicationResult
                }
                ... on LensProfileManagerRelayError {
                ...LensProfileManagerRelayError
                }
            }
            }

            fragment LensProfileManagerRelayError on LensProfileManagerRelayError {
            __typename
            reason
            }

            fragment CreateMomokaPublicationResult on CreateMomokaPublicationResult {
            __typename
            id
            proof
            momokaId
            }`,
    },
    (type: ComposeType) => {
        throw new UnreachableError('composeType', type);
    },
);
