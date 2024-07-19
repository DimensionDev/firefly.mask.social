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
            postOnMomoka(request: $request) {
                ... on CreateMomokaPublicationResult {
                id
                proof
                momokaId
                }
                ... on LensProfileManagerRelayError {
                reason
                }
            }
            }

        `,
        reply: `mutation CommentOnMomoka($request: MomokaCommentRequest!) {
            commentOnMomoka(request: $request) {
                ... on CreateMomokaPublicationResult {
                id
                proof
                momokaId
                }
                ... on LensProfileManagerRelayError {
                    reason
                    }
            }
        }
        `,
        quote: `mutation QuoteOnMomoka($request: MomokaQuoteRequest!) {
             quoteOnMomoka(request: $request) {
                ... on CreateMomokaPublicationResult {
                id
                proof
                momokaId
                }
                ... on LensProfileManagerRelayError {
                    reason
                    }
            }
                }
`,
    },
    (type: ComposeType) => {
        throw new UnreachableError('composeType', type);
    },
);
